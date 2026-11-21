"""Numbers of the project page, read from the paper so the page follows it.

Writes assets/data.js (window.AMIGO_DATA) from
  ../paper_v2/sections/results.tex                                  retrieval, merged lake, SQL tables
  ../experiments/results/tree_complexity_2026-11-18/questions.json  forks per question (the paper's tree figure)
Usage, from the amigo repo root: .venv/bin/python project_page/tools/page_data.py
"""
import json
import re
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
ROOT = PAGE.parent
RESULTS = (ROOT / "paper_v2/sections/results.tex").read_text()
TREE = json.loads((ROOT / "experiments/results/tree_complexity_2026-11-18/questions.json").read_text())
BENCHMARKS = ["BIRD", "Spider", "MMQA"]  # Spider 2.0-Lite has 24 multi-valid questions: not drawn
NAMES = {"Baseline 1": "LLM sets"}  # the page's name of a method


def clean(cell):
    cell = re.sub(r"\\(textbf|underline)\{([^{}]*)\}", r"\2", cell)
    return cell.replace(r"\sys", "AMIGO").replace(r"$^\dagger$", "").replace("~", " ").replace(r"\quad", "").strip()


def table(label):
    body = RESULTS[:RESULTS.index(rf"\label{{{label}}}")]
    body = body[body.rindex(r"\begin{tabular"):body.rindex(r"\bottomrule")]
    return body


def number(cell):
    try:
        return float(cell.replace("$", "").replace("{,}", ""))
    except ValueError:
        return None


def retrieval():
    """label -> benchmark -> method -> [R, CR, P, size]; plus the group of each method."""
    out, groups = {}, {}
    body = table("tab:res-retrieval")
    for label, part in zip(("single", "multi"), body.split(r"\midrule[\heavyrulewidth]")):
        group = None
        for line in part.splitlines():
            cells = [clean(c) for c in line.strip().removesuffix(r"\\").split("&")]
            if len(cells) < 18 or not cells[1] or cells[1] == "Method":
                continue
            group = cells[0] or group
            name = NAMES.get(cells[1], cells[1])
            groups[name] = group
            for i, b in enumerate(BENCHMARKS):
                vals = [number(c) for c in cells[2 + 4 * i:6 + 4 * i]]
                if None not in vals:
                    out.setdefault(label, {}).setdefault(b, {})[name] = vals
    return out, groups


def merged():
    """lake size -> method -> {R, CR, P, R*, CR*, P*}."""
    keys = ("R", "CR", "P", "R*", "CR*", "P*")
    lakes, current = {}, None
    for line in table("tab:res-merged").splitlines():
        cells = [clean(c) for c in line.strip().removesuffix(r"\\").split("&")]
        size = re.search(r", ([\d{},]+) tables", cells[0])
        if size:
            current = int(size.group(1).replace("{,}", ""))
            lakes[current] = {}
        elif len(cells) >= 7 and cells[0] in ("Baseline 1", "AMIGO lazy", "AMIGO whole judge"):
            lakes[current][NAMES.get(cells[0], cells[0])] = dict(zip(keys, map(number, cells[1:7])))
    return lakes


def sql():
    """label -> benchmark -> row -> execution accuracy."""
    out = {"single": {}, "multi": {}}
    for line in table("tab:res-sql").splitlines():
        cells = [clean(c) for c in line.strip().removesuffix(r"\\").split("&")]
        if len(cells) != 7 or cells[0] in ("", "Method"):
            continue
        for i, b in enumerate(BENCHMARKS):
            for j, label in enumerate(("single", "multi")):
                v = number(cells[1 + 2 * i + j])
                if v is not None:
                    out[label].setdefault(b, {})[cells[0]] = v
    return out


def tight():
    """version -> [unneeded tables of AMIGO conservative, of CORE-T, EX of each] (the paper's tight-sets table)."""
    names = {r"\birdsv": "BIRD SV", r"\birdmv": "BIRD MV", r"\spidersv": "Spider SV", r"\spidermv": "Spider MV",
             r"\mmqasv": "MMQA SV", r"\mmqamv": "MMQA MV"}
    out = {}
    for line in table("tab:res-tight").splitlines():
        cells = [clean(c) for c in line.strip().removesuffix(r"\\").split("&")]
        if len(cells) == 5 and cells[0] in names:
            out[names[cells[0]]] = [number(c) for c in cells[1:]]
    if len(out) != 6:
        raise SystemExit("the tight-sets table is not the one expected")
    return out


def forks():
    """Mean forks per question and 95% bootstrap interval, by valid table sets and by tables needed, as in the
    paper's tree figure (same groups, same random draws)."""
    rng = np.random.default_rng(0)
    out, single = {"tables": {}, "labeled_sets": {}}, {}
    for key in ("tables", "labeled_sets"):
        for lake, name in (("bird_dev", "BIRD"), ("spider_dev", "Spider"), ("mmqa", "MMQA")):
            pts = []
            for x in (1, 2, 3, 4):
                f = np.array([r["forks"] for r in TREE.values() if r["lake"] == lake
                              and (r[key] == x if x < 4 else r[key] >= 4)], float)
                if len(f) < 20:
                    continue
                boot = f[rng.integers(0, len(f), (2000, len(f)))].mean(axis=1)
                pts.append([x, round(f.mean(), 2), round(np.percentile(boot, 2.5), 2), round(np.percentile(boot, 97.5), 2), len(f)])
            out[key][name] = pts
    for lake, name in (("bird_dev", "BIRD"), ("spider_dev", "Spider"), ("mmqa", "MMQA")):
        rows = [r for r in TREE.values() if r["lake"] == lake]
        single[name] = round(100 * sum(r["forks"] == 0 for r in rows) / len(rows), 1)
    return out, single


ret, groups = retrieval()
fk, no_fork = forks()
data = {"retrieval": ret, "groups": groups, "merged": merged(), "sql": sql(), "tight": tight(), "forks": fk, "noFork": no_fork}
(PAGE / "assets/data.js").write_text("// Made by tools/page_data.py from the paper. Do not edit.\nwindow.AMIGO_DATA = "
                                     + json.dumps(data, separators=(",", ":")) + ";\n")
print(json.dumps(data, indent=1)[:4000])
