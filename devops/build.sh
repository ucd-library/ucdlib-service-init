#! /bin/bash

set -e

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $ROOT_DIR

source config.sh

#! /bin/bash

# for google cloud multi-arch builds
if [[ $LOCAL_DEV == 'true' ]]; then
  DOCKER_BUILD="docker build"
else
  docker context create amd_node --docker "host=unix:///var/run/docker.sock"
  docker context create arm_node --docker "host=ssh://ci-bot@$ARM64_MACHINE_IP"

  docker buildx create --use --name ucd-lib-builder --platform linux/amd64 amd_node
  docker buildx create --append --name ucd-lib-builder --platform linux/arm64 arm_node

  DOCKER_BUILD="docker buildx build --platform linux/amd64,linux/arm64 --push"
fi



echo "building: $NODE_IMAGE_NAME:$BRANCH_NAME"
$DOCKER_BUILD \
  --cache-from $NODE_IMAGE_NAME:$BRANCH_NAME \
  -t $NODE_IMAGE_NAME:$BRANCH_NAME \
  --build-arg NODE_VERSION=$NODE_VERSION \
  -f ../Dockerfile \
  ../