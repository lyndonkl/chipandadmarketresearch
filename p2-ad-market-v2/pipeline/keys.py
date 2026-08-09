#!/usr/bin/env python3.12
"""
keys.py — THE SINGLE ID AUTHORITY for the P2 v2 knowledge graph.

Attempt one's single worst defect was three modules minting three spellings of the same id, so the
same thing became two nodes. This module is the ONLY place any id string is constructed. Every other
module imports these functions. No other file may contain an id-format literal
("m:adspend:", "tu:era:", "n|", "dim:") — a CI test (tests/test_no_foreign_key_minting.py) fails the
build if one does.

Grain and scope (locked design):
- A model-extracted node id is UNIT-SCOPED: node_id(unit_id, name, type). The same name in two
  different units stays two different nodes; cross-unit identity is L1's job, never L0's. Within one
  unit, an identical (name, type) intentionally collapses to one node.
- A dimension entity (medium, money_type) is GLOBAL: dim_id(kind, value). These come from a
  controlled vocabulary of exact-match values, so a deterministic code merge is safe and correct
  (not the fuzzy identity problem L1 solves). They bridge to fuzzy claim entities at L1.
- An ad-spend measurement id is deterministic from the frozen data: adspend_id(...).
"""
from __future__ import annotations
import hashlib
import re

SEP = "\x1f"

# --------------------------------------------------------------------------- #
# Normalisation — the one definition, used everywhere an id part is built
# --------------------------------------------------------------------------- #
_WS = re.compile(r"\s+")


def norm(s: str) -> str:
    """Lower, trim, collapse whitespace. The canonical id-part normaliser."""
    return _WS.sub(" ", str(s).strip().lower())


def _part(s: str) -> str:
    """An id part safe to place between '|' delimiters (no bare delimiter)."""
    return norm(s).replace("|", "/")


def rel_type(raw: str) -> str:
    """Sanitise a model relation TYPE into a legal Neo4j relationship type
    (UPPER_SNAKE, alnum+underscore). Over-long types are the loader's to trim, not this."""
    t = re.sub(r"[^A-Z0-9_]", "_", (raw or "REL").upper()).strip("_")
    return t or "REL"


# --------------------------------------------------------------------------- #
# Unit ids (the provenance key each node/edge inherits)
# --------------------------------------------------------------------------- #
_ERA = range(1, 8)
_CLAIM_RE = re.compile(r"^(e[1-7]|ds|mech)-")  # claim id families in the frozen corpus


def is_claim_unit(unit_id: str) -> bool:
    return bool(_CLAIM_RE.match(unit_id))


def prose_field_key(era: int, field: str) -> str:
    _check_era(era)
    return f"tu:era:{era}:field:{field}"


def prose_event_key(era: int, index: int) -> str:
    _check_era(era)
    if index < 0:
        raise ValueError(f"event index must be >= 0, got {index}")
    return f"tu:era:{era}:event:{index}"


def prose_boundary_key(era: int) -> str:
    _check_era(era)
    return f"tu:era:{era}:boundary"


def _check_era(era: int) -> None:
    if era not in _ERA:
        raise ValueError(f"era must be 1..7, got {era!r}")


# --------------------------------------------------------------------------- #
# Ad-spend measurement id — m:adspend:{series}:{year}:{medium}:{money_type|unsplit}
# --------------------------------------------------------------------------- #
_REJECT_MT = {"_", "null", "none", ""}


def money_type_token(money_type) -> str:
    """Absent money_type -> 'unsplit'. Literal 'null'/'_'/''/'none' are REJECTED (data error)."""
    if money_type is None:
        return "unsplit"
    tok = str(money_type).strip()
    if tok.lower() in _REJECT_MT:
        raise ValueError(f"illegal money_type token {money_type!r}: null/_/empty are rejected; "
                         f"absent must arrive as Python None, not a string")
    return tok


def adspend_id(series: str, year, medium: str, money_type) -> str:
    if not series or not medium:
        raise ValueError(f"adspend_id needs series and medium, got {series!r}, {medium!r}")
    yr = int(year)
    return f"m:adspend:{series}:{yr}:{medium}:{money_type_token(money_type)}"


# --------------------------------------------------------------------------- #
# Node ids
# --------------------------------------------------------------------------- #
def node_id(unit_id: str, name: str, node_type: str) -> str:
    """Unit-scoped model-extracted node id. Within-unit (name,type) duplicates collapse; cross-unit
    they never do."""
    if not unit_id or not name:
        raise ValueError(f"node_id needs unit_id and name, got {unit_id!r}, {name!r}")
    return f"n|{unit_id}|{_part(name)}|{_part(node_type)}"


def dim_id(kind: str, value: str) -> str:
    """Global controlled-vocabulary dimension entity id (kind in {'medium','money_type'})."""
    if kind not in ("medium", "money_type"):
        raise ValueError(f"dimension kind must be 'medium' or 'money_type', got {kind!r}")
    if not value:
        raise ValueError("dim_id needs a value")
    return f"dim:{kind}:{norm(value)}"


# --------------------------------------------------------------------------- #
# Edge id — deterministic, for logging/repair records (Neo4j MERGEs on endpoints+type)
# --------------------------------------------------------------------------- #
def edge_id(unit_id: str, from_id: str, rtype: str, to_id: str) -> str:
    return f"e|{unit_id}|{from_id}|{rel_type(rtype)}|{to_id}"


# --------------------------------------------------------------------------- #
# Parent ids (L1+). Content-addressed on the SORTED CHILD SET, never the
# model-chosen name: same membership is idempotent across re-runs, and two piles
# the model both names "Google" can never collide onto one id. The name rides as
# a property. This is what makes the gate content-hash reproducible.
# --------------------------------------------------------------------------- #
def _hash(uids) -> str:
    return hashlib.sha1(SEP.join(sorted(uids)).encode()).hexdigest()[:16]


def parent_id(layer: int, child_uids) -> str:
    if layer < 1:
        raise ValueError(f"parent layer must be >= 1, got {layer}")
    if not child_uids:
        raise ValueError("parent_id needs at least one child uid")
    return f"L{layer}|{_hash(child_uids)}"


def block_key(name: str) -> str:
    """Blocking key for candidate generation: normalized name with '_' folded to
    space, so the money-graph dimension 'direct_mail' shares a block with the claim
    'direct mail' (the deterministic dimension bridge). NOT an id, never minted onto a node."""
    return norm(name).replace("_", " ")


def community_id(layer: int, member_uids) -> str:
    """Content-addressed id for a Leiden community parent (L3+), keyed on the member set.
    The 'c' marks it a community parent (structure-derived), distinct from a semantic parent_id."""
    if layer < 1:
        raise ValueError(f"community layer must be >= 1, got {layer}")
    if not member_uids:
        raise ValueError("community_id needs at least one member")
    return f"L{layer}|c{_hash(member_uids)}"


if __name__ == "__main__":
    # self-test against real corpus ids — proves the shapes, never the only test
    assert parent_id(1, ["b", "a", "c"]) == parent_id(1, ["c", "b", "a"]), "order-independent"
    assert parent_id(1, ["a"]) != parent_id(2, ["a"]), "layer in id"
    assert block_key("direct_mail") == block_key("Direct  mail") == "direct mail", "bridge block key"
    assert node_id("e1-creators-001", "Volney B. Palmer", "person") == \
        node_id("e1-creators-001", "  volney b.  palmer ", "PERSON"), "within-unit norm/dedup"
    assert node_id("e1-creators-001", "Google", "company") != node_id("e1-medium-002", "Google", "company"), \
        "cross-unit stays distinct"
    assert adspend_id("coen_mce", 1919, "total", None) == "m:adspend:coen_mce:1919:total:unsplit"
    assert adspend_id("naa_newspaper", 1950, "newspapers", "national_brand") == \
        "m:adspend:naa_newspaper:1950:newspapers:national_brand"
    for bad in ("_", "null", "", "none"):
        try:
            adspend_id("s", 2000, "m", bad); raise AssertionError(f"should reject {bad!r}")
        except ValueError:
            pass
    assert dim_id("medium", "Newspapers") == "dim:medium:newspapers"
    assert dim_id("money_type", "national_brand") == "dim:money_type:national_brand"
    assert prose_field_key(1, "CREATORS") == "tu:era:1:field:CREATORS"
    assert prose_event_key(6, 0) == "tu:era:6:event:0"
    assert prose_boundary_key(1) == "tu:era:1:boundary"
    assert is_claim_unit("e1-creators-001") and is_claim_unit("mech-first_price-001") and is_claim_unit("ds-gap-001")
    assert not is_claim_unit("tu:era:1:field:CREATORS")
    print("keys.py self-test PASSED")
