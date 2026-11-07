#!/usr/bin/env bash
# Local release: runs the checks, then builds the same artifacts the release
# workflow publishes, so a local build can be compared with the published
# SHA256SUMS.
#
# Usage: scripts/release.sh
set -euo pipefail
cd "$(dirname "$0")/.."

version="$(node -p "require('./package.json').version")"
out="release/offline-tools-v${version}"

pnpm install --frozen-lockfile
pnpm lint
pnpm exec tsc -b
pnpm test:run
pnpm test:e2e:single

scripts/build-release.sh "$out"

echo
echo "Release written to $out. Compare with the published SHA256SUMS:"
echo "  (cd $out && shasum -a 256 -c SHA256SUMS)"
