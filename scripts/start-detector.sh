#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source config/weiyesha.env
exec ./src/detector/detector \
  -listen "${WEIYESHA_HOST}:${WEIYESHA_PORT}" \
  -token "${WEIYESHA_TOKEN}" \
  -daemon "python3 $(pwd)/src/daemon.py --no-heartbeat" \
  -timeout 60s
