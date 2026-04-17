#!/usr/bin/env bash
# EduCycle — local verify (BE + FE). Run from repo root: bash infra/scripts/verify.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "== Backend: mvn clean verify =="
(cd "$ROOT/apps/api" && mvn -q clean verify)

echo "== Frontend: typecheck + build =="
(cd "$ROOT/apps/web" && npm run typecheck && npm run build)

echo "Done."
