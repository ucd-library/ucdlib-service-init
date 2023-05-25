#! /bin/bash

NODE_VERSION=18
# KAFKA_IMAGE=bitnami/kafka:2.5.0
KAFKA_IMAGE=bitnami/kafka:3.2.0

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

NODE_IMAGE_NAME=$A6T_REG_HOST/init-services