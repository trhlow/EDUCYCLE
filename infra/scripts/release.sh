#!/usr/bin/env bash
# =============================================================================
#  EduCycle – Release Script
#  Usage:  bash release.sh
#  Effect: Merges dev → main, tags the release, creates a hotfix branch.
# =============================================================================
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
CODEBASE="${GITHUB_WORKSPACE:-$(pwd)}"
DEV_BRANCH="dev"
MAIN_BRANCH="main"

# ── Setup git identity ───────────────────────────────────────────────────────
git config user.name  "Release Bot"
git config user.email "bot@educycle.dev"

cd "${CODEBASE}"

# ── 1. Get release version from VERSION file or latest tag ───────────────────
if [[ -f VERSION ]]; then
  TAG=$(cat VERSION)
else
  TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
fi

echo "🏷️  Release version: ${TAG}"

# ── 2. Run sanity checks ─────────────────────────────────────────────────────
echo "🔎 Checking for uncommitted changes..."
if [[ -n "$(git status --porcelain)" ]]; then
  echo "❌ There are uncommitted changes. Please commit or stash before releasing."
  exit 1
fi

# ── 3. Pull latest dev ───────────────────────────────────────────────────────
git checkout "${DEV_BRANCH}"
git pull origin "${DEV_BRANCH}"

# ── 4. Merge dev → main (no fast-forward) ────────────────────────────────────
echo "🔀 Merging ${DEV_BRANCH} → ${MAIN_BRANCH}..."
git checkout "${MAIN_BRANCH}"
git pull origin "${MAIN_BRANCH}"
git merge --no-ff "${DEV_BRANCH}" -m "release: merge ${DEV_BRANCH} → ${MAIN_BRANCH} (${TAG})"
git push origin "${MAIN_BRANCH}"

# ── 5. Tag the release on main ───────────────────────────────────────────────
echo "🏷️  Tagging ${TAG} on ${MAIN_BRANCH}..."
# Delete tag locally if it exists (was already created on dev)
git tag -d "${TAG}" 2>/dev/null || true
git push origin ":refs/tags/${TAG}" 2>/dev/null || true

git tag -a "${TAG}" -m "Release ${TAG} – Stable EduCycle backend"
git push origin "${TAG}"

# ── 6. Create hotfix branch from the release tag ─────────────────────────────
HOTFIX_BRANCH="${TAG}"
echo "🌿 Creating hotfix branch: ${HOTFIX_BRANCH}..."
git checkout -b "${HOTFIX_BRANCH}" || git checkout "${HOTFIX_BRANCH}"
git push origin "${HOTFIX_BRANCH}"

# ── 7. Return to dev ─────────────────────────────────────────────────────────
git checkout "${DEV_BRANCH}"

echo ""
echo "✅ Release ${TAG} complete!"
echo "   • ${MAIN_BRANCH} updated and tagged with ${TAG}"
echo "   • Hotfix branch: ${HOTFIX_BRANCH}"
echo "   • Back on: ${DEV_BRANCH}"
