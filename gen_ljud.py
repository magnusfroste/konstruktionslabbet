#!/usr/bin/env python3
"""Genererar mp3 för varje mening appen säger (ur data.js) + lines.js.

    python3 gen_ljud.py
"""
import hashlib, json, os, shutil, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(HERE, "public")
LJUD = os.path.join(PUB, "ljud")
VOICE = "sv-SE-SofieNeural"
ROSTEN = "/opt/data/projects/skolappar-next/tools/rosten.js"

os.makedirs(LJUD, exist_ok=True)
raw = subprocess.check_output(["node", "-e",
    "const D=require('./public/data.js');console.log(JSON.stringify(D.meningar()))"], cwd=HERE)
meningar = json.loads(raw)
print(f"{len(meningar)} meningar")


def hid(t):
    return hashlib.md5(t.encode("utf-8")).hexdigest()[:10]


def tala(text):
    h = hid(text)
    out = os.path.join(LJUD, h + ".mp3")
    if os.path.exists(out) and os.path.getsize(out) > 800:
        return h
    for försök in range(12):
        rate = "-4%" if försök % 2 == 0 else "-5%"
        if os.path.exists(out) and os.path.getsize(out) == 0:
            os.remove(out)
        p = subprocess.run([sys.executable, "-m", "edge_tts", "--voice", VOICE, "--rate=" + rate,
                            "--text", text, "--write-media", out], capture_output=True)
        if p.returncode == 0 and os.path.exists(out) and os.path.getsize(out) > 800:
            return h
        time.sleep(1.5 + (försök % 4))
    raise RuntimeError("edge-tts nekade: " + text + " :: " + p.stderr.decode()[-200:])


for t in meningar:
    tala(t)

lines = {t: hid(t) for t in meningar}
with open(os.path.join(LJUD, "lines.js"), "w", encoding="utf-8") as f:
    f.write("/* Genererad av gen_ljud.py – en mp3 per mening appen säger. */\n")
    f.write("window.__ROST = " + json.dumps(lines, ensure_ascii=False, indent=1) + ";\n")
shutil.copy(ROSTEN, os.path.join(LJUD, "rosten.js"))
print(f"{len(lines)} filer i {LJUD}")