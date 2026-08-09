import json, time, urllib.request
from collections import defaultdict, Counter
from neo4j import GraphDatabase
PROMPT=open("l2_adjudicate_prompt.txt").read()
a=GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j","12345678"))

def memhist(s):
    h=defaultdict(list)
    for r in s.run("MATCH (p:L1)-[:PARENT_OF]->(c) RETURN p.uid AS u, c.type AS t"):
        if r["t"]: h[r["u"]].append(r["t"])
    return {u:", ".join(t for t,_ in Counter(v).most_common(5)) for u,v in h.items()}

def adjudicate(members):
    pile="\n".join(f"[{i+1}] {m['name']} | {m['type']} | {m['grain']} | member types: {m['hist']}" for i,m in enumerate(members))
    body=json.dumps({"model":"gpt-oss:120b","prompt":PROMPT.replace("{PILE}",pile),"stream":False,"keep_alive":"30m","options":{"temperature":0.1,"num_ctx":32768}}).encode()
    req=urllib.request.Request("http://localhost:11434/api/generate", data=body, headers={"Content-Type":"application/json"})
    with urllib.request.urlopen(req, timeout=600) as r: raw=json.load(r).get("response","")
    groups={}
    for ln in raw.splitlines():
        p=[x.strip() for x in ln.strip().split("|")]
        if p[0]=="GROUP" and len(p)>=6: groups[p[1]]={"name":p[2],"grain":p[4],"reason":p[5],"m":[]}
        elif p[0]=="MEMBER" and len(p)>=3 and p[1] in groups:
            try: groups[p[1]]["m"].append(int(p[2]))
            except: pass
    return groups

with a.session(database="admarket") as s:
    hist=memhist(s)
    s.run("CALL gds.graph.drop('l2e', false) YIELD graphName").consume()
    s.run("CALL gds.graph.project('l2e','L1',{PARENT_OF:{orientation:'NATURAL'}},{nodeProperties:['l2_embedding']})").consume()
    km={r["u"]:r["c"] for r in s.run("CALL gds.kmeans.stream('l2e',{nodeProperty:'l2_embedding',k:120,randomSeed:1,maxIterations:20}) YIELD nodeId,communityId RETURN gds.util.asNode(nodeId).uid AS u, communityId AS c")}
    s.run("CALL gds.graph.drop('l2e', false) YIELD graphName").consume()
    info={r["u"]:r for r in s.run("MATCH (p:L1) RETURN p.uid AS u, p.name AS name, p.type AS type, p.grain AS grain").data()}
clu=defaultdict(list)
for u,c in km.items(): clu[(info[u]["grain"],c)].append(u)
# pick one entity cluster and one measurement cluster of size 8-14
picks=[]
for (grain,c),uids in clu.items():
    if 8<=len(uids)<=14 and grain in ("Entity","Measurement") and not any(p[0]==grain for p in [(x[0],) for x in picks]):
        picks.append((grain, uids)); 
    if len(picks)==2: break
for grain,uids in picks:
    members=[{"name":info[u]["name"],"type":info[u]["type"],"grain":info[u]["grain"],"hist":hist.get(u,"")} for u in uids]
    groups=adjudicate(members)
    print(f"\n{'='*70}\n{grain} cluster: {len(members)} L1 nodes -> {len(groups)} kinds")
    for g in groups.values():
        print(f"  KIND: {g['name']}  ({g['reason'][:45]})")
        for idx in g["m"]:
            print(f"      <- {members[idx-1]['name']}")
a.close()
