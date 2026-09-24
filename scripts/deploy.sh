#!/bin/bash
set -euo pipefail

# Dashboard Deploy Script (VPS)
# Usage: ./deploy.sh <IMAGE_TAG>

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/healthcheck.sh"

IMAGE_TAG="${1:?Usage: ./deploy.sh <IMAGE_TAG>}"
REGISTRY="ghcr.io/imranwebdeveloper/mobilehaat-dashboard"
IMAGE_FULL="$REGISTRY:$IMAGE_TAG"
CONTAINER="mobilehaat-dashboard"
COMPOSE_DIR="/opt/mobilehaat/dashboard"

cd "$COMPOSE_DIR"

echo "=== Deploy starting ==="
echo "Image: $IMAGE_FULL"

# Save current image for rollback
docker inspect --format='{{.Config.Image}}' "$CONTAINER" > .last-image 2>/dev/null || true

# Pull new image
echo "Pulling image..."
docker pull "$IMAGE_FULL"

# Deploy
export IMAGE_TAG
docker compose up -d --force-recreate

# Health check
if health_check "$CONTAINER"; then
  echo "=== Deploy successful ==="
  exit 0
fi

# Rollback
echo "=== Rolling back ==="
PREV_IMAGE=$(cat .last-image 2>/dev/null || true)
if [ -n "$PREV_IMAGE" ]; then
  PREV_TAG=$(echo "$PREV_IMAGE" | sed 's|.*/||')
  export IMAGE_TAG="$PREV_TAG"
  docker compose up -d --force-recreate
  health_check "$CONTAINER" && echo "Rollback successful" || echo "Rollback also failed"
else
  echo "No previous image to rollback to"
fi
exit 1
