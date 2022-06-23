#! /bin/bash

NODE_VERSION=16

if [[ -z $BRANCH_NAME ]]; then
  BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
fi

GC_PROJECT_ID=digital-ucdavis-edu

# Set A6T_REG_HOST
if [[ -z $A6T_REG_HOST ]]; then
  A6T_REG_HOST=gcr.io/ucdlib-pubreg

  # set local-dev tags used by 
  # local development docker-compose file
  if [[ ! -z $LOCAL_DEV ]]; then
    A6T_REG_HOST=localhost/local-dev
  fi
fi

NODE_IMAGE_NAME=init-services
KAFKA_IMAGE_NAME=init-services-kafka