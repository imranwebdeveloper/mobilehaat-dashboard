#!/bin/bash
set -euo pipefail

# Dashboard Rollback Script (VPS)
# Usage: ./rollback.sh [IMAGE_TAG]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/healthcheck.sh"

REGISTRY="ghcr.io/imranwebdeveloper/mobilehaat-dashboard"
CONTAINER="mobilehaat-dashboard"
COMPOSE_DIR="/opt/mobilehaat/dashboard"

cd "$COMPOSE_DIR"

if [ -n "${1:-}" ]; then
  ROLLBACK_TAG="$1"
else
  if [ ! -f .last-image ]; then
    echo "No previous image found. Usage: ./rollback.sh <tag>"
    exit 1
  fi
  ROLLBACK_TAG=$(cat .last-image | sed 's|.*/||')
fi

echo "Rolling back to: $REGISTRY:$ROLLBACK_TAG"

if ! docker image inspect "$REGISTRY:$ROLLBACK_TAG" > /dev/null 2>&1; then
  echo "Image not found locally, pulling..."
  docker pull "$REGISTRY:$ROLLBACK_TAG"
fi

docker inspect --format='{{.Config.Image}}' "$CONTAINER" > .last-image 2>/dev/null || true

export IMAGE_TAG="$ROLLBACK_TAG"
docker compose up -d --force-recreate

if health_check "$CONTAINER"; then
  echo "Rollback successful on $ROLLBACK_TAG"
  exit 0
fi

echo "Rollback health check failed"
exit 1
