#!/usr/bin/env python3
"""Fusiona el vocab.json del artefacto (proyecto English Teacher) con el del repositorio.

Uso:  python3 -I tools/sync.py RUTA/vocab_del_artefacto.json

Reglas:
- El artefacto manda: sus términos nuevos o editados sustituyen a los del repo.
- Los términos que solo existen en el repo (p. ej. de la tarea semanal) se conservan.
- Nunca se borra un id (el progreso del móvil va ligado al id).
- Si el resultado no es igual al artefacto, o su versión no supera a la publicada,
  se asigna una versión nueva AAAA.MM.DD[.N] para que la app la detecte.
Salida (stdout, JSON): {"changed": bool, "version": str, "republish_artifact": bool, "added": [...], "edited": [...]}
"""
import datetime
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO_FILE = os.path.join(ROOT, "vocab.json")


def ver(v):
    return [int(x) for x in str(v).replace("-", ".").split(".")]


def bump(*versions):
    """Versión nueva mayor que todas: la fecha de hoy, o la mayor existente con .N+1."""
    today = datetime.date.today().strftime("%Y.%m.%d")
    top = max(versions, key=ver)
    if ver(today) > ver(top):
        return today
    p = top.split(".")
    return ".".join(p[:3] + [str(int(p[3]) + 1 if len(p) > 3 else 2)])


def main():
    art = json.load(open(sys.argv[1], encoding="utf-8"))
    repo = json.load(open(REPO_FILE, encoding="utf-8"))
    R = {x["id"]: x for x in repo["V"]}
    A = {x["id"]: x for x in art["V"]}

    merged = dict(art)
    merged["V"] = list(art["V"]) + [x for x in repo["V"] if x["id"] not in A]
    for k in ("CATS", "PREPS", "REGISTERS", "CONN_CATS"):
        merged[k] = {**repo.get(k, {}), **art.get(k, {})}

    added = [i for i in A if i not in R]
    edited = [i for i in A if i in R and A[i] != R[i]]
    repo_only = [i for i in R if i not in A]

    # changelog: unión por versión, la del artefacto primero
    seen, cl = set(), []
    for e in art.get("changelog", []) + repo.get("changelog", []):
        if e["version"] not in seen:
            seen.add(e["version"]); cl.append(e)
    merged["changelog"] = sorted(cl, key=lambda e: ver(e["version"]), reverse=True)

    content_same_as_repo = {x["id"]: x for x in merged["V"]} == R
    if content_same_as_repo:
        print(json.dumps({"changed": False, "version": repo["version"], "republish_artifact": bool(repo_only),
                          "added": [], "edited": []}, ensure_ascii=False))
        return

    needs_new = bool(repo_only) or ver(art["version"]) <= ver(repo["version"])
    if needs_new:
        v = bump(art["version"], repo["version"])
        merged["version"] = v
        merged["updated"] = datetime.date.today().isoformat()
        note = f"Sincronizado desde el proyecto English Teacher: +{len(added)} nuevos, {len(edited)} editados. Total {len(merged['V'])}."
        merged["notes"] = note
        merged["changelog"].insert(0, {"version": v, "date": merged["updated"], "notes": note})

    json.dump(merged, open(REPO_FILE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(json.dumps({"changed": True, "version": merged["version"], "republish_artifact": bool(repo_only) or needs_new,
                      "added": [A[i]["term"] for i in added], "edited": [A[i]["term"] for i in edited]},
                     ensure_ascii=False))


if __name__ == "__main__":
    main()
