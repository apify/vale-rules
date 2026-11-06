#!/usr/bin/env bash
set -euo pipefail

repository=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "${1:?Provide an output directory}"
output=$(cd "$1" && pwd)
staging=$(mktemp -d)
trap 'rm -rf "$staging"' EXIT
mkdir -p "$staging/ApifyStyleGuide/styles"
for style in Apify ApifyDocs ApifyUI ApifyContent; do
  cp -R "$repository/styles/$style" "$staging/ApifyStyleGuide/styles/"
done
cp "$repository/LICENSE" "$staging/ApifyStyleGuide/"
(cd "$staging" && zip -qr ApifyStyleGuide.zip ApifyStyleGuide -x '*.DS_Store')
cp "$staging/ApifyStyleGuide.zip" "$output/ApifyStyleGuide.zip"
