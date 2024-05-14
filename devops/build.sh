#! /bin/bash

set -e

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $ROOT_DIR

source config.sh

#! /bin/bash

DOCKER_BUILD="docker buildx build"

# for google cloud multi-arch builds
if [[ $LOCAL_DEV == 'true' ]]; then
  # DOCKER_BUILD="$DOCKER_BUILD --pull --output=type=docker"
  DOCKER_BUILD="$DOCKER_BUILD --pull"
else
  docker context create amd_node --docker "host=unix:///var/run/docker.sock"
  docker context create arm_node --docker "host=ssh://ci-bot@$ARM64_MACHINE_IP"

  docker buildx create --use --name ucd-lib-builder --platform linux/amd64 amd_node
  docker buildx create --append --name ucd-lib-builder --platform linux/arm64 arm_node

  DOCKER_BUILD="$DOCKER_BUILD --platform linux/amd64,linux/arm64 --pull --push"
fi



echo "building: $NODE_IMAGE_NAME:$BRANCH_NAME"

BASE_BUILD="$DOCKER_BUILD \
  --cache-from $NODE_IMAGE_NAME:$BRANCH_NAME \
  -t $NODE_IMAGE_NAME:$BRANCH_NAME \
  --build-arg NODE_VERSION=$NODE_VERSION \
  -f ../Dockerfile"

$BASE_BUILD ../

if [[ $LOCAL_DEV != 'true' ]]; then
  echo "stopping buildx builder"
  docker buildx stop ucd-lib-builder || true

  echo "building with cache and pushing"
  $BASE_BUILD \
    --cache-from $NODE_IMAGE_NAME:$BRANCH_NAME \
    --cache-to=type=inline \
    --push \
    ../
fi