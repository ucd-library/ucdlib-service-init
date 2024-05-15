#! /bin/bash

set -e
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $ROOT_DIR

source ./config.sh

function create_manifests() {
  create_manifest $1:$BRANCH_NAME
  if [[ ! -z "$FIN_TAG_NAME" ]]; then
    create_manifest $1:$FIN_TAG_NAME
  fi
}

function create_manifest() {
  docker manifest create $1 \
    --amend $1-amd \
    --amend $1-arm
  docker manifest push $1
}

create_manifests $NODE_IMAGE_NAME