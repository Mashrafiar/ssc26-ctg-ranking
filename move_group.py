#!/usr/bin/env python3
"""Humanities JSON-এ থাকা Business-গ্রুপের স্টুডেন্টদের Business JSON-এ সরায়, দুটোই আবার র‍্যাংক করে।
চালাও:  python move_group.py            (আগে .bak ব্যাকআপ হয়)"""
import json, re, shutil, sys
HUM, BUS = "hsc26-humanities-data.json", "hsc26-business-data.json"
KEY = lambda r: (-float(r["GPA"]), -float(r["Total Marks"]), int(r["Roll"]))

def load(p): return json.load(open(p, encoding="utf-8"))
def save(p, rows):
    out = []
    for i, r in enumerate(sorted(rows, key=KEY), 1):
        d = {"Rank": i}; d.update({k: v for k, v in r.items() if k != "Rank"}); out.append(d)
    json.dump(out, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    return len(out)

hum, bus = load(HUM), load(BUS)
move = [r for r in hum if re.search(r"business|commerce", r.get("Group", ""), re.I)]
stay = [r for r in hum if r not in move]
have = {r["Roll"] for r in bus}
move = [r for r in move if r["Roll"] not in have]
if not move:
    print("সরানোর মতো কিছু নেই"); sys.exit(0)
for p in (HUM, BUS): shutil.copy(p, p + ".bak")
n_h = save(HUM, stay); n_b = save(BUS, bus + move)
print("সরানো হয়েছে:", [(r["Roll"], r["Name"], r["Group"]) for r in move])
print(f"Humanities: {len(hum)} -> {n_h} | Business: {len(bus)} -> {n_b}  (ব্যাকআপ: *.bak)")
