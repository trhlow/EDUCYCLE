# -*- coding: utf-8 -*-
"""
One-shot: remove Made-with: Cursor lines from every commit message (history rewrite).
Run from repo root: python infra/scripts/strip_cursor_commit_messages.py
Requires: git-filter-repo (pip install git-filter-repo)
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]

# Executed by git-filter-repo for each commit message (variable: message: bytes)
CALLBACK = r"""import re
if not message:
    return message
out = re.sub(rb"(?mi)^\s*Made-with:\s*Cursor\s*\r?\n", b"", message)
out = re.sub(rb"(?mi)^\s*Made with Cursor\s*\r?\n", b"", out)
return out.rstrip() + b"\n"
"""


def _run(cmd: list[str], **kw) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, cwd=str(REPO_ROOT), check=True, text=True, **kw)


def main() -> int:
    r = subprocess.run(
        ["git", "-C", str(REPO_ROOT), "remote", "get-url", "origin"],
        capture_output=True,
        text=True,
    )
    origin = (r.stdout or "").strip() if r.returncode == 0 else ""

    subprocess.run(
        ["git-filter-repo", "--force", "--message-callback", CALLBACK],
        cwd=str(REPO_ROOT),
        check=True,
    )

    remotes = subprocess.run(
        ["git", "-C", str(REPO_ROOT), "remote"],
        capture_output=True,
        text=True,
    )
    names = (remotes.stdout or "").split()
    if origin and "origin" not in names:
        _run(["git", "remote", "add", "origin", origin])
        print("Re-added remote origin:", origin)
    elif not origin:
        print("No origin URL saved; add remote manually if needed.")

    print("Done. Sample: git log --format=fuller -3")
    return 0


if __name__ == "__main__":
    sys.exit(main())
