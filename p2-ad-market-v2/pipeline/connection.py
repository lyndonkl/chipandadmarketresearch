#!/usr/bin/env python3.12
"""
connection.py — per-phase least-privilege connection factory.

The pipeline NEVER connects as admin. Each phase gets the single least-privileged user that phase
needs. Admin credentials live only in rbac.py's bootstrap and are not importable here — a stage
module can only obtain a phase driver, never an admin one (defect #3 hardening).

Phases:
  loader  — p2_load  / role p2_loader  : may write L0 (used ONLY during the L0 load)
  builder — p2_build / role p2_builder : may write L1+, DENIED any mutation of :L0 (used L1 onward)
  reader  — p2_read  / role p2_reader  : read-only (gate inspection, reports, reading approvals)
"""
from __future__ import annotations
from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
DB = "admarket"

# Least-privilege pipeline users. rbac.py creates each with exactly this password; this is the ONLY
# copy, so the two can never drift. These are NOT admin.
PIPELINE_USERS = {
    "loader":  ("p2_load",  "p2loaderPW2026", "p2_loader"),
    "builder": ("p2_build", "p2builderPW2026", "p2_builder"),
    "reader":  ("p2_read",  "p2readerPW2026", "p2_reader"),
}


def get_driver(phase: str):
    if phase not in PIPELINE_USERS:
        raise ValueError(f"unknown phase {phase!r}; one of {list(PIPELINE_USERS)}")
    user, pw, _role = PIPELINE_USERS[phase]
    return GraphDatabase.driver(URI, auth=(user, pw))


def session(phase: str):
    return get_driver(phase).session(database=DB)
