#! /bin/bash

set -e

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $ROOT_DIR

echo "building: $NODE_IMAGE_NAME:$BRANCH_NAME"
docker build \
  --cache-from $NODE_IMAGE_NAME:$BRANCH_NAME \
  -t $NODE_IMAGE_NAME:$BRANCH_NAME \
  -f ../Dockerfile.node \
  ../

echo "building: $KAFKA_IMAGE_NAME:$BRANCH_NAME"
docker build \
  --cache-from $KAFKA_IMAGE_NAME:$BRANCH_NAME \
  -t $KAFKA_IMAGE_NAME:$BRANCH_NAME \
  -f ../Dockerfile.kafka \
  ../