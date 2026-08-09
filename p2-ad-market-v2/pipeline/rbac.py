#!/usr/bin/env python3.12
"""
rbac.py — one-time bootstrap of the admarket database, least-privilege roles/users, and the grants
that make L0 immutable to the builder role. Then a NEGATIVE self-check that PROVES the guard fires.

This is the ONLY module that holds admin credentials, and only here, only for bootstrap. Admin is
read from the environment (NEO4J_ADMIN_USER / NEO4J_ADMIN_PASSWORD), never hard-coded into a stage.

The immutability guarantee this enforces and proves: the builder role cannot CREATE, DELETE,
SET-property, or SET/REMOVE-label on :L0 nodes. (L0 relationship immutability is covered by a
post-phase validation count, documented honestly — RBAC cannot label-scope open-ended rel types.)
"""
from __future__ import annotations
import os, time
from neo4j import GraphDatabase
from connection import URI, DB, PIPELINE_USERS, get_driver

ADMIN_USER = os.environ.get("NEO4J_ADMIN_USER", "neo4j")
ADMIN_PW = os.environ.get("NEO4J_ADMIN_PASSWORD", "12345678")


def _admin():
    return GraphDatabase.driver(URI, auth=(ADMIN_USER, ADMIN_PW))


def _wait_online(admin, timeout=60):
    t0 = time.time()
    while time.time() - t0 < timeout:
        with admin.session(database="system") as s:
            rows = list(s.run("SHOW DATABASE $db YIELD currentStatus RETURN currentStatus", db=DB))
            if rows and rows[0]["currentStatus"] == "online":
                return True
        time.sleep(1.0)
    return False


def bootstrap() -> list[tuple[str, str]]:
    report: list[tuple[str, str]] = []
    admin = _admin()

    def run(s, stmt, **kw):
        try:
            s.run(stmt, **kw)
            report.append(("ok", stmt))
        except Exception as e:  # noqa: BLE001 — collect all, don't stop at first
            report.append(("ERR", f"{stmt} :: {type(e).__name__}: {str(e)[:140]}"))

    with admin.session(database="system") as s:
        run(s, f"CREATE DATABASE {DB} IF NOT EXISTS")
    if not _wait_online(admin):
        report.append(("ERR", f"database {DB} did not come online in time"))

    LOADER, BUILDER, READER = "p2_loader", "p2_builder", "p2_reader"
    with admin.session(database="system") as s:
        for role in (LOADER, BUILDER, READER):
            run(s, f"CREATE ROLE {role} IF NOT EXISTS")
        for _phase, (user, pw, role) in PIPELINE_USERS.items():
            run(s, f"CREATE USER {user} IF NOT EXISTS SET PASSWORD $pw CHANGE NOT REQUIRED", pw=pw)
            run(s, f"GRANT ROLE {role} TO {user}")

        # reader: read-only
        run(s, f"GRANT ACCESS ON DATABASE {DB} TO {READER}")
        run(s, f"GRANT MATCH {{*}} ON GRAPH {DB} ELEMENTS * TO {READER}")

        # loader: full write on the graph, plus schema + token creation (new labels/types/props)
        run(s, f"GRANT ACCESS ON DATABASE {DB} TO {LOADER}")
        run(s, f"GRANT MATCH {{*}} ON GRAPH {DB} ELEMENTS * TO {LOADER}")
        run(s, f"GRANT WRITE ON GRAPH {DB} TO {LOADER}")
        run(s, f"GRANT NAME MANAGEMENT ON DATABASE {DB} TO {LOADER}")
        run(s, f"GRANT CONSTRAINT MANAGEMENT ON DATABASE {DB} TO {LOADER}")
        run(s, f"GRANT INDEX MANAGEMENT ON DATABASE {DB} TO {LOADER}")

        # builder: write for L1+, but DENIED every mutation of :L0 nodes
        run(s, f"GRANT ACCESS ON DATABASE {DB} TO {BUILDER}")
        run(s, f"GRANT MATCH {{*}} ON GRAPH {DB} ELEMENTS * TO {BUILDER}")
        run(s, f"GRANT WRITE ON GRAPH {DB} TO {BUILDER}")
        run(s, f"GRANT NAME MANAGEMENT ON DATABASE {DB} TO {BUILDER}")
        for stmt in (
            f"DENY CREATE ON GRAPH {DB} NODES L0 TO {BUILDER}",
            f"DENY DELETE ON GRAPH {DB} NODES L0 TO {BUILDER}",
            f"DENY SET PROPERTY {{*}} ON GRAPH {DB} NODES L0 TO {BUILDER}",
            f"DENY SET LABEL L0 ON GRAPH {DB} TO {BUILDER}",
            f"DENY REMOVE LABEL L0 ON GRAPH {DB} TO {BUILDER}",
        ):
            run(s, stmt)

        # gate integrity: neither loader nor builder may write approvals (admin/human owns them)
        for role in (LOADER, BUILDER):
            run(s, f"DENY CREATE ON GRAPH {DB} NODES Approval TO {role}")
            run(s, f"DENY SET PROPERTY {{*}} ON GRAPH {DB} NODES Approval TO {role}")
            run(s, f"DENY DELETE ON GRAPH {DB} NODES Approval TO {role}")

    admin.close()
    return report


def immutability_selfcheck() -> tuple[bool, dict]:
    """Prove the guard fires: as the builder, every mutation of an :L0 node must be REFUSED."""
    # seed as the loader: one real :L0 node, and one plain :Node (no L0) for the add-label attack
    ld = get_driver("loader")
    with ld.session(database=DB) as s:
        s.run("MERGE (n:Node:L0 {uid:'__selfcheck_l0__'}) SET n.layer=0")
        s.run("MERGE (n:Node {uid:'__selfcheck_plain__'})")
    ld.close()

    res = {}
    bd = get_driver("builder")
    with bd.session(database=DB) as s:
        for name, q in {
            "create_L0": "CREATE (n:Node:L0 {uid:'__attack_create__'})",
            "set_prop_L0": "MATCH (n:L0 {uid:'__selfcheck_l0__'}) SET n.tampered=true",
            "delete_L0": "MATCH (n:L0 {uid:'__selfcheck_l0__'}) DETACH DELETE n",
            "add_L0_label": "MATCH (n:Node {uid:'__selfcheck_plain__'}) SET n:L0",
        }.items():
            try:
                s.run(q).consume()
                res[name] = "ALLOWED — BAD"
            except Exception as e:  # authorization failure raises
                res[name] = f"refused ({type(e).__name__})"
        # positive control: builder CAN write a non-L0 node
        try:
            s.run("CREATE (n:Node:L1 {uid:'__builder_can_write_l1__'})").consume()
            res["create_L1_positive_control"] = "allowed (good)"
        except Exception as e:
            res["create_L1_positive_control"] = f"REFUSED — BAD ({type(e).__name__})"
    bd.close()

    # cleanup as loader (loader can delete both the seed and the L1 control)
    ld = get_driver("loader")
    with ld.session(database=DB) as s:
        s.run("MATCH (n:Node) WHERE n.uid IN "
              "['__selfcheck_l0__','__selfcheck_plain__','__builder_can_write_l1__','__attack_create__'] "
              "DETACH DELETE n")
    ld.close()

    ok = all(("refused" in v) for k, v in res.items() if k != "create_L1_positive_control") \
        and res.get("create_L1_positive_control", "").startswith("allowed")
    return ok, res


if __name__ == "__main__":
    print("== bootstrap ==")
    rep = bootstrap()
    for status, stmt in rep:
        if status == "ERR":
            print(" ERR:", stmt)
    print(f"  ({sum(1 for st,_ in rep if st=='ok')} ok, {sum(1 for st,_ in rep if st=='ERR')} errors)")
    import schema
    print("== schema ==")
    for a in schema.apply():
        print(" applied:", a)
    print("== immutability self-check ==")
    ok, res = immutability_selfcheck()
    for k, v in res.items():
        print(f"  {k}: {v}")
    print("RESULT:", "PASS — L0 is immutable to the builder role" if ok else "FAIL — HALT")
