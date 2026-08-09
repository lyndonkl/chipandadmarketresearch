#!/usr/bin/env python3.12
"""
schema.py — uniqueness constraints and indexes for the admarket graph.

The uid uniqueness constraint is the database-level backstop against defect #1 (key collision): even
if two code paths somehow built the same id, a duplicate write becomes a database ERROR, not a silent
overwrite. Every node carries a base :Node label plus a layer label (:L0/:L1/...) plus a grain label
(:Entity/:Measurement/:Dimension).
"""
from __future__ import annotations
from connection import DB, get_driver

CONSTRAINTS = [
    "CREATE CONSTRAINT node_uid_unique IF NOT EXISTS FOR (n:Node) REQUIRE n.uid IS UNIQUE",
]
INDEXES = [
    "CREATE INDEX node_origin IF NOT EXISTS FOR (n:Node) ON (n.origin)",
    "CREATE INDEX node_layer IF NOT EXISTS FOR (n:Node) ON (n.layer)",
]


def apply() -> list[str]:
    applied = []
    drv = get_driver("loader")  # loader has write; constraints are schema writes
    try:
        with drv.session(database=DB) as s:
            for stmt in CONSTRAINTS + INDEXES:
                s.run(stmt)
                applied.append(stmt.split("IF NOT EXISTS")[0].strip())
    finally:
        drv.close()
    return applied


if __name__ == "__main__":
    for a in apply():
        print("applied:", a)
