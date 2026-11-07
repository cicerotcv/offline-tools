#!/usr/bin/env bash
# Builds the release artifacts into a directory, reproducibly:
#   offline-tools-v<version>.html      single-file app (USB, Tails, file://)
#   offline-tools-v<version>-site.zip  hosted build (self-host or serve locally)
#   SHA256SUMS                         hashes of both
# The same commit always yields the same bytes: the zip uses the commit date
# as every file's mtime, a fixed file order and no extra attributes.
#
# Usage: scripts/build-release.sh <out-dir>
set -euo pipefail
cd "$(dirname "$0")/.."

out="$1"
version="$(node -p "require('./package.json').version")"
name="offline-tools-v${version}"
epoch="$(git log -1 --format=%ct)"
mkdir -p "$out"
out="$(cd "$out" && pwd)"

pnpm build:single >/dev/null
cp dist/index.html "$out/${name}.html"

pnpm build >/dev/null
find dist -exec touch -h -d "@${epoch}" {} + 2>/dev/null ||
  find dist -exec touch -h -t "$(TZ=UTC date -r "$epoch" +%Y%m%d%H%M.%S)" {} +
rm -f "$out/${name}-site.zip"
(cd dist && find . -type f | LC_ALL=C sort | TZ=UTC zip -X -D -q -@ "$out/${name}-site.zip")

(cd "$out" && shasum -a 256 "${name}.html" "${name}-site.zip" > SHA256SUMS)
cat "$out/SHA256SUMS"
