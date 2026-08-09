import json, time, urllib.request
from neo4j import GraphDatabase
import candidates
from connection import DB

PROMPT = open("l1_adjudicate_prompt.txt").read()

def adjudicate(members):
    pile = "\n".join(f"[{i+1}] {m['name']} | {m['type']} | {m['grain']} | {m['origin']} | {m['facts']}"
                     for i, m in enumerate(members))
    body = json.dumps({"model":"gpt-oss:120b","prompt":PROMPT.replace("{PILE}", pile),
                       "stream":False,"keep_alive":"30m","options":{"temperature":0.1,"num_ctx":32768}}).encode()
    req = urllib.request.Request("http://localhost:11434/api/generate", data=body, headers={"Content-Type":"application/json"})
    t0=time.time()
    with urllib.request.urlopen(req, timeout=600) as r: resp=json.load(r)
    raw=resp.get("response","")
    groups={}
    for ln in raw.splitlines():
        p=[x.strip() for x in ln.strip().split("|")]
        if p[0]=="GROUP" and len(p)>=6: groups[p[1]]={"name":p[2],"type":p[3],"grain":p[4],"reason":p[5],"members":[]}
        elif p[0]=="MEMBER" and len(p)>=3 and p[1] in groups:
            try: groups[p[1]]["members"].append(int(p[2]))
            except: pass
    return groups, round(time.time()-t0,1), members

drv=GraphDatabase.driver("bolt://localhost:7687", auth=candidates.ADMIN)
def fetch(q, **kw):
    with drv.session(database=DB) as s: rows=s.run(q, **kw).data()
    out=[]
    for r in rows:
        p=r["p"]; L=r["labels"]
        grain="Measurement" if "Measurement" in L else ("Dimension" if "Dimension" in L else "Entity")
        facts="; ".join(f"{k}={p[k]}" for k in ["year","value","central","unit","money_type","source_series","about_year","clause"] if p.get(k) not in (None,""))
        out.append({"name":p.get("name",""),"type":p.get("type",""),"grain":grain,"origin":p.get("origin"),"facts":facts[:90]})
    return out

tests = {
 "GOOGLE (entity co-reference, sampled 40)":
   "MATCH (n:L0) WHERE toLower(n.name)='google' RETURN labels(n) AS labels, properties(n) AS p LIMIT 40",
 "NEWSPAPER adspend total/national/local x years (measure abstraction + breakdown split)":
   "MATCH (n:L0) WHERE n.kind='adspend' AND n.medium='newspapers' AND n.year IN [1935,1950,1978,2000] RETURN labels(n) AS labels, properties(n) AS p",
 "LOCAL advertising spend (cross-name measure abstraction)":
   "MATCH (n:Measurement) WHERE toLower(n.name) CONTAINS 'local' AND (toLower(n.name) CONTAINS 'spend' OR toLower(n.name) CONTAINS 'advertising') RETURN labels(n) AS labels, properties(n) AS p LIMIT 18",
}
for title,q in tests.items():
    members=fetch(q)
    groups,el,mem=adjudicate(members)
    print(f"\n{'='*80}\n{title}\n  {len(members)} nodes -> {len(groups)} parent meta nodes ({el}s)")
    for gid,g in groups.items():
        print(f"  PARENT [{g['grain']}] {g['name']}  ({g['type']})  — {g['reason']}")
        for idx in g["members"][:8]:
            m=mem[idx-1]; print(f"      <- {m['name']}  [{m['facts'][:55]}]")
        if len(g["members"])>8: print(f"      <- ... +{len(g['members'])-8} more")
drv.close()
