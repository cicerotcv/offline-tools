#!/usr/bin/env bash
# Vercel "Ignored Build Step" (vercel.json ignoreCommand).
# Exit 1 = build, exit 0 = skip.
#
# Previews always build. Production builds only when the commit raises the
# package.json version, which only the release PR does (prepare-release.yml):
# merging it is what deploys the site, and the same merge publishes the release.
set -u

if [ "${VERCEL_ENV:-}" != "production" ]; then
  echo "Preview deployment: building."
  exit 1
fi

version_at() {
  git show "$1:package.json" 2>/dev/null |
    node -p "JSON.parse(require('fs').readFileSync(0, 'utf8')).version" 2>/dev/null
}

previous="$(version_at HEAD^)"
if [ -z "${previous}" ]; then
  # Shallow clone without the parent: build rather than block a release.
  echo "Previous version unknown: building."
  exit 1
fi

if node scripts/next-version.mjs --is-release "${previous}"; then
  echo "Version raised from ${previous}: release commit, building production."
  exit 1
fi

echo "Version not raised (previous ${previous}): not a release, skipping the production build."
exit 0
