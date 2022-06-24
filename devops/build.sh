#! /bin/bash

set -e

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $ROOT_DIR

source config.sh

echo "building: $NODE_IMAGE_NAME:$BRANCH_NAME"
docker build \
  --cache-from $NODE_IMAGE_NAME:$BRANCH_NAME \
  -t $NODE_IMAGE_NAME:$BRANCH_NAME \
  --build-arg NODE_VERSION=$NODE_VERSION \
  -f ../Dockerfile.node \
  ../

echo "building: $KAFKA_IMAGE_NAME:$BRANCH_NAME"
docker build \
  --cache-from $KAFKA_IMAGE_NAME:$BRANCH_NAME \
  -t $KAFKA_IMAGE_NAME:$BRANCH_NAME \
  --build-arg NODE_VERSION=$NODE_VERSION \
  --build-arg KAFKA_IMAGE=$KAFKA_IMAGE \
  -f ../Dockerfile.kafka \
  ../