#!/bin/bash
# Shared health check function for deploy and rollback scripts
# Usage: source this file, then call: health_check <container> <url> <retries> <interval>

health_check() {
  local container="$1"
  local url="${2:-http://localhost:3000/api/health}"
  local retries="${3:-6}"
  local interval="${4:-5}"

  echo "Waiting for health check..."
  for i in $(seq 1 "$retries"); do
    if docker exec "$container" wget --no-verbose --tries=1 -q -O- "$url" 2>/dev/null | grep -q '"status":"ok"'; then
      echo "Container healthy"
      return 0
    fi
    echo "Waiting... ($i/$retries)"
    sleep "$interval"
  done

  echo "Health check failed after $retries attempts"
  return 1
}
