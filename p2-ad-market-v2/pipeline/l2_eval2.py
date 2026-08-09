import l2_eval
from neo4j import GraphDatabase
a=GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j","12345678"))
with a.session(database="admarket") as s:
    hist=l2_eval.memhist(s)
    def grp(q):
        return [{"name":r["name"],"type":r["type"],"grain":r["grain"],"hist":hist.get(r["uid"],"")}
                for r in s.run(q).data()]
    m=grp("MATCH (p:L1:Measurement) WHERE toLower(p.name) CONTAINS 'total' AND toLower(p.name) CONTAINS 'advertising spend' RETURN p.uid AS uid, p.name AS name, p.type AS type, p.grain AS grain LIMIT 14")
    e=grp("MATCH (p:L1:Entity) WHERE p.name IN ['Google','Yahoo','Overture','NBC','CBS','WPP','Newspapers','Radio','Television','Direct mail'] RETURN p.uid AS uid, p.name AS name, p.type AS type, p.grain AS grain")
for title, members in [("MEASUREMENT - US total spend variants (want ~1 kind)", m),
                       ("ENTITY - mixed specifics (want role-kinds)", e)]:
    g=l2_eval.adjudicate(members)
    print(f"\n{'='*66}\n{title}: {len(members)} -> {len(g)} kinds")
    for x in g.values():
        print(f"  KIND: {x['name']}  <- {[members[i-1]['name'] for i in x['m']]}")
a.close()
