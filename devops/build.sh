#! /bin/bash

set -e

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $ROOT_DIR

source config.sh

#! /bin/bash
DOCKER="docker"
if [[ ! -z $BUILD_ARCHITECTURE ]]; then
  DOCKER="$DOCKER --context $BUILD_ARCHITECTURE"
fi

DOCKER_BUILD="$DOCKER buildx build --output=type=docker --cache-to=type=inline,mode=max "
if [[ $LOCAL_DEV != 'true' ]]; then
  DOCKER_BUILD="$DOCKER_BUILD --pull "
fi

DOCKER_PUSH="$DOCKER push "

function push() {
  if [[ $LOCAL_DEV == 'true' ]]; then
    echo "Skipping push for local dev"
    return
  fi

  if [[ -z $BUILD_ARCHITECTURE ]]; then
    echo "No build architecture set, skipping push"
    return
  fi

  $DOCKER_PUSH $1:$BRANCH_NAME-$BUILD_ARCHITECTURE
  if [[ ! -z "$FIN_TAG_NAME" ]]; then
    $DOCKER_PUSH $1:$FIN_TAG_NAME-$BUILD_ARCHITECTURE
  fi
}

# for google cloud multi-arch builds
if [[ $LOCAL_DEV == 'true' ]]; then
  # DOCKER_BUILD="$DOCKER_BUILD --pull --output=type=docker"
  DOCKER_BUILD="$DOCKER_BUILD --pull"
elif [[ $BUILD_ARCHITECTURE == 'amd' ]]; then
  docker context create amd --docker "host=unix:///var/run/docker.sock" || true
elif [[ $BUILD_ARCHITECTURE == 'arm' ]]; then
  eval `ssh-agent`
  ssh-add /root/.ssh/ci-bot
  docker context create arm --docker "host=ssh://ci-bot@$ARM64_MACHINE_IP" || true
fi


echo "building: $NODE_IMAGE_NAME:$BRANCH_NAME-$BUILD_ARCHITECTURE"

$DOCKER_BUILD \
  -t $NODE_IMAGE_NAME:$BRANCH_NAME-$BUILD_ARCHITECTURE \
  --build-arg NODE_VERSION=$NODE_VERSION \
  -f ../Dockerfile \
  ../

push $NODE_IMAGE_NAME

# if [[ $LOCAL_DEV != 'true' ]]; then
#   echo "stopping buildx builder"
#   # docker buildx stop ucd-lib-builder || true

#   echo "building with cache and pushing"
#   $BASE_BUILD \
#     --cache-from $NODE_IMAGE_NAME:$BRANCH_NAME \
#     --cache-to=type=inline \
#     --push \
#     ../
# fi