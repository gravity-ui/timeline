#!/usr/bin/env bash
#
# icon-image-search.sh — reverse image search for Gravity UI icons.
#
# Send a screenshot/photo/mock of an icon, get back the closest
# @gravity-ui/icons names from https://gravity-ui.com.
#
# Usage:
#   icon-image-search.sh <path-to-image> [--png|--jpeg]
#
# Examples:
#   icon-image-search.sh ./screenshot.png
#   icon-image-search.sh ./icon.jpg --jpeg
#
# Requires: curl. Exits non-zero on missing file / curl failure.
# Prints the raw response body (the matched icon names).

set -euo pipefail

ENDPOINT="https://gravity-ui.com/api/icons-search"

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <path-to-image> [--png|--jpeg]" >&2
  exit 64
fi

IMAGE="$1"
shift || true

# Content type: explicit flag wins, else infer from extension, default png.
CTYPE="image/png"
EXPLICIT=0
while [ "$#" -gt 0 ]; do
  case "$1" in
    --png)        CTYPE="image/png";  EXPLICIT=1 ;;
    --jpeg|--jpg) CTYPE="image/jpeg"; EXPLICIT=1 ;;
    *) echo "Unknown option: $1" >&2; exit 64 ;;
  esac
  shift
done
# Infer from extension only when no explicit flag was passed.
if [ "$EXPLICIT" -eq 0 ]; then
  case "${IMAGE##*.}" in
    jpg|JPG|jpeg|JPEG) CTYPE="image/jpeg" ;;
    png|PNG)           CTYPE="image/png" ;;
  esac
fi

if [ ! -f "$IMAGE" ]; then
  echo "File not found: $IMAGE" >&2
  exit 66
fi

# Minimal headers: content-type is required (raw image body); origin/referer
# in case the server gates on same-origin. Analytics cookies are omitted.
exec curl -sS --fail-with-body "$ENDPOINT" \
  -X POST \
  -H 'accept: */*' \
  -H "content-type: $CTYPE" \
  -H 'origin: https://gravity-ui.com' \
  -H 'referer: https://gravity-ui.com/icons' \
  -H 'user-agent: gravity skill' \
  --data-binary "@$IMAGE"
