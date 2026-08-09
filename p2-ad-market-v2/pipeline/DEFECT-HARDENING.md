# Foundation build — defect-hardening contract

The four defect classes that killed the first P2 v2 build, each to be made *structurally impossible* — enforced in code or the database, and paired with a self-check that proves the guard fires. This is the contract the **foundation build** (Workflow 0) must satisfy before any layer runs. Internal working note.

> Forward-looking hardening checklist for the FOUNDATION BUILD (not the extraction prompt), making each of attempt one's four defect classes structurally impossible rather than merely discouraged. Grounded in real records: 506 claims across id families e1-e7/ds/mech, prose keys tu:era:{N}:field:{FIELD} over 8 fields, and adspend keys m:adspend:{series}:{year}:{medium}:{money_type} with money_type absent on 1,042 of 1,573 points. The spine: (1) ONE module mints every id and the database rejects duplicates, with unit-scoped keys that preserve the ~640-island L0 model and a unit-matched value-attach; (2) declare-before-use, no year nodes, a produce/consume DAG preflight, an every-node-has-parent invariant, and exclusions wired as edges kill dangling references; (3) a real least-privilege pipeline user is GRANTED its role, L0 is DENIED to the builder role and proven immutable by a negative self-check, and the frozen corpus stays read-only and hash-checked; (4) gates halt in code, fail-closed, bound to the layer's content hash, with approval state the builder role cannot write. Every mitigation is enforced in code or the database and paired with a self-check that proves the guard actually fires. Module paths are under /Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/p2-ad-market-v2/pipeline/.


## 1. Primary-key collision

### 1.1

**Risk.** Three modules (claim loader, prose loader, adspend ingest) each build id strings with their own f-string, so m:adspend:coen_mce:1949:newspaper:unsplit gets spelled three ways and one point becomes two nodes. Attempt one called three modules minting three spellings its single worst defect.

**Mitigation.** One module is the sole id authority, exposing node_id(), edge_id(), adspend_id(), prose_unit_key(), measurement_node_id(). No other file may contain an id-format literal (m:adspend:, tu:era:). A CI grep test fails the build if any other module emits those literals, so imports are the only way to make a key.

**Where.** `p2-ad-market-v2/pipeline/keys.py (owning module) + tests/test_no_foreign_key_minting.py`

### 1.2

**Risk.** L0 is ~640 disconnected islands by design; the Google in one claim and the Google in another must stay separate until L1 decides. If a node id derives from name+type alone, same-named nodes across units silently pre-merge and destroy the island model before clustering runs; conversely two distinct concepts inside one unit could collide.

**Mitigation.** node_id = f(unit_id, normalized_name, type), so every id is unit-scoped and cross-unit identity is L1's job, never L0's. A unit test asserts the actorless entity 'national newspaper advertising' emitted by e1-medium-002 and by e2-medium-001 yields two different ids.

**Where.** `p2-ad-market-v2/pipeline/keys.py node_id(); documented L0 island invariant`

### 1.3

**Risk.** money_type is absent on 1,042 of 1,573 adspend points. If one path serializes absent as unsplit, another as _ or empty or null, the same measurement mints twice. null and _ are explicitly rejected values.

**Mitigation.** adspend_id() normalizes absent money_type to the single sentinel 'unsplit' and raises on null/_/empty; a Neo4j IS UNIQUE constraint on node id is created before any load so a duplicate write is a database error, not a silent overwrite. A test enumerates all 1,573 points and asserts zero id collisions.

**Where.** `p2-ad-market-v2/pipeline/keys.py adspend_id() + pipeline/schema.py (uniqueness constraint)`

### 1.4

**Risk.** The number is withheld at L0 and attached later deterministically by claim id, but a single claim reifies several measurements (e1-buyers-005 names $55M national, $220M local and a 20 percent share) while the claim carries exactly one central+unit. Attaching central to the wrong measurement node, or to all of them, silently corrupts or double-counts values.

**Mitigation.** The attach step joins the claim's central/ci80 to the one measurement node whose reified unit matches the claim's unit field; if zero or more than one node matches, halt and log for repair rather than guess. No value property is ever written from model text, only from claims.json. Match uniqueness is asserted per claim id.

**Where.** `p2-ad-market-v2/pipeline/provenance.py (value attach, keyed on claim_id + unit)`


## 2. Dangling references

### 2.1

**Risk.** The model emits an EDGE whose endpoint name was never declared by a NODE line, or an inverse-duplicate edge (the exact failure of the weaker models in section 6). Writing it creates an edge to a node that does not exist.

**Mitigation.** The loader resolves every edge endpoint against NODE lines from the SAME unit's output; an undeclared endpoint is repaired by promoting it to a node, or the edge is dropped and logged, never written dangling. Deterministic repair beats retry, and every repair is logged.

**Where.** `p2-ad-market-v2/pipeline/l0_loader.py (parse + repair stage)`

### 2.2

**Risk.** Statements are dense with years (1914, 1949, 2019) and every claim carries an about_year, so the model is tempted to make a year a node and point edges at it. A year node is banned by locked decision 7, so any edge to one dangles.

**Mitigation.** The loader rejects any NODE whose name/type is a bare year and drops or repairs edges pointing at one; about_year rides as a property on the claim's real nodes, never as a node. A validator scans loaded L0 and fails the layer if a year-shaped node exists.

**Where.** `p2-ad-market-v2/pipeline/l0_loader.py (year-rejection rule) + tests/test_no_year_nodes.py`

### 2.3

**Risk.** A stage reads an artifact or node label no upstream stage produces (attempt one's defect 2) - e.g. L1 clustering reads an L0 property the loader never wrote, or connect-parents reads a parents field never populated.

**Mitigation.** Each stage declares the artifacts and labels it PRODUCES and CONSUMES; a preflight walks the DAG and refuses to start if any consumed artifact has no upstream producer. The manifest is the single source for run order, so a missing producer is caught before the run, not mid-run.

**Where.** `p2-ad-market-v2/pipeline/manifest.py (produce/consume DAG) + preflight validator`

### 2.4

**Risk.** The design requires every node and every relationship to end up with a parent, no exceptions. A member the judge will not place, left parentless, is an upward dangling reference that breaks the top-down climb-down guarantee; a parent id referenced but never created dangles downward.

**Mitigation.** After each layer build, an invariant check asserts every lower node/rel resolves to at least one existing parent, with unplaceable members given a singleton parent in code (not by convention); node-id and parent-id constraints make an unresolved parent reference a write error. Fail-closed if any node lacks a parent.

**Where.** `p2-ad-market-v2/pipeline/layers.py (parent invariant) + pipeline/schema.py (referential constraints)`

### 2.5

**Risk.** A claim that excludes or contrasts (mech-first_price-001: the DISPLAY exchange moved to first price and SEARCH did not; e1-buyers-007's outlay-vs-receipts contrast) names an excluded entity. Left inside a description field, that entity is an orphaned reference with no node, and the distinction is lost.

**Mitigation.** Per locked decision 6 the excluded/contrasted entity is emitted as a declared NODE with an explicit EXCLUDES/CONTRASTS_WITH edge, so the reference is a first-class resolvable relationship, never free text. The loader preserves the exclusion edge; a lint flags contrast keywords that arrive with no exclusion edge for human review.

**Where.** `p2-ad-market-v2/pipeline/l0_loader.py (exclusion handling)`


## 3. Access control created but never granted

### 3.1

**Risk.** Attempt one created a restricted role but no user held it, and the pipeline connected as admin, so Layer 0 was writable the whole time. The admarket database does not even exist yet.

**Mitigation.** The one-time bootstrap CREATEs the admarket database, a least-privilege role, and a real pipeline user, then GRANTs the role TO that user. The pipeline authenticates as that user, never as neo4j/admin. Admin credentials are used only inside this bootstrap and are not importable by pipeline stages.

**Where.** `p2-ad-market-v2/pipeline/rbac.py (CREATE DATABASE / CREATE ROLE / CREATE USER / GRANT ROLE TO user)`

### 3.2

**Risk.** L0 is never edited, not once ever, but a single all-powerful pipeline user could rewrite it after the fact. A comment or a code path that simply avoids editing L0 does not stop a later stage or a bug from doing so.

**Mitigation.** L0 nodes/rels carry an :L0 label; after the L0 gate passes, the layer-building role is DENIED WRITE and DELETE on :L0. L0 is written by a separate short-lived phase role, and every later phase connects through a factory that issues only the least-privileged role for that phase, so the builder role structurally cannot mutate L0.

**Where.** `p2-ad-market-v2/pipeline/rbac.py (deny grants) + pipeline/connection.py (per-phase least-privilege factory)`

### 3.3

**Risk.** A grant or deny that was mis-scoped looks configured but still allows writes; nobody notices until L0 is silently altered downstream.

**Mitigation.** After granting, the bootstrap runs a NEGATIVE self-check: connect as the builder role and attempt to write and to delete an :L0 node, and assert both are refused; if either succeeds, halt the whole run. This mirrors the corpus's own b8-alt-selfcheck discipline (prove the guard can fire: 19 mutations, 19 caught).

**Where.** `p2-ad-market-v2/pipeline/rbac.py (immutability self-check)`

### 3.4

**Risk.** The frozen 506-claim corpus under p2-ad-market/ must never change; a stray write or in-place edit poisons every layer, and admin/default credentials sitting in pipeline config invite exactly that.

**Mitigation.** Hash every file under p2-ad-market/data before and after each run and halt on any mismatch; open the corpus read-only; keep no admin or default credentials in any stage's runtime config (a test greps stage modules for them). This makes the read-only frozen contract structural rather than trusted.

**Where.** `p2-ad-market-v2/pipeline/corpus_hash.py + connection config`


## 4. Advisory approval gates

### 4.1

**Risk.** Five of six crossings in attempt one halted only by printing a message or testing for a file flag any process could echo into existence, so the pipeline walked past unapproved layers after L0, L1, L2 and each Leiden layer.

**Mitigation.** The gate is a function that blocks the next stage in code and is fail-closed: absent or ambiguous approval stops the run, and the default path does not continue. It also emits the required gate report and Cypher query pack, but the report is a product of halting, never a substitute for the block.

**Where.** `p2-ad-market-v2/pipeline/gates.py (fail-closed gate controller)`

### 4.2

**Risk.** Even a real approval can be forged or go stale - a leftover approved flag from L1 waves L2 through unreviewed, and any process can create the flag.

**Mitigation.** Human approval is recorded against the specific layer's content hash; the gate recomputes the current layer hash and proceeds only if an approval matches THAT hash, so a stale or fabricated flag fails. Approval state is written under a role the pipeline/building user does NOT hold - it can read approvals but never write them - tying gate integrity back to RBAC.

**Where.** `p2-ad-market-v2/pipeline/gates.py (approval bound to layer content hash) + pipeline/rbac.py (approval-write privilege withheld from builder role)`
