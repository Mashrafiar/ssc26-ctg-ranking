#!/usr/bin/env python3
"""
Build slim data files from the big raw board JSON files.

  raw file (20+ MB)  ->  data/<raw>.list.json         ranking list only   (~2-3 MB)
                         data/d/<raw>/<roll % 256>.json   full records, 256 small shards

The website (data-loader.js) uses these automatically and falls back to the raw
file if they are missing, so nothing breaks if you forget to run this.
Run:  python3 build_data.py        (or let the GitHub Action do it)
"""
import json, os, shutil, sys

RAW = ["data.json", "business-data.json", "humanities-data.json", "hsc26-science-data.json",
       "hsc26-business-data.json", "hsc26-humanities-data.json"]
SHARDS = 256
# keys the ranking / college / school pages need (both short-key and raw-key styles)
KEEP = ["rk", "rl", "nm", "gp", "tm", "inst", "Rank", "Roll", "Roll No", "Name", "GPA", "Total Marks", "Institute"]
SUBJECT_KEYS = ["sb", "Subjects", "Subject Wise Marks"]

def dump(obj, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))

def total_from_subjects(r):
    for k in SUBJECT_KEYS:
        v = r.get(k)
        if isinstance(v, dict):
            vals = v.values()
        elif isinstance(v, list):
            vals = [x.get("Obtain Marks") for x in v if isinstance(x, dict)]
        else:
            continue
        t = 0
        for x in vals:
            try: t += float(str(x).strip())
            except ValueError: pass
        return int(t) if t == int(t) else t
    return 0

def roll_of(r):
    return str(r.get("rl") or r.get("Roll") or r.get("Roll No") or "").strip()

def main():
    shutil.rmtree("data", ignore_errors=True)
    for name in RAW:
        if not os.path.exists(name):
            continue
        with open(name, encoding="utf-8") as f:
            data = json.load(f)
        slim, shards = [], {}
        for r in data:
            o = {k: r[k] for k in KEEP if k in r}
            if "tm" not in o and "Total Marks" not in o:
                o["tm"] = total_from_subjects(r)      # pages fall back to subjects otherwise
            slim.append(o)
            roll = roll_of(r)
            if roll.isdigit():
                shards.setdefault(int(roll) % SHARDS, []).append(r)
        base = os.path.splitext(name)[0]
        dump(slim, f"data/{name[:-5]}.list.json")
        for k, recs in shards.items():
            dump(recs, f"data/d/{base}/{k}.json")
        print(f"{name}: {len(data)} students -> list {os.path.getsize(f'data/{name[:-5]}.list.json')/1e6:.2f} MB, {len(shards)} shards")

if __name__ == "__main__":
    sys.exit(main())
