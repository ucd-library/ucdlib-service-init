#! /bin/bash

set -e
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $ROOT_DIR

source ./config.sh
gcloud config set project ${GC_PROJECT_ID}

echo "Submitting build to Google Cloud project ${GC_PROJECT_ID}..."
gcloud builds submit \
  --config ./cloudbuild.yaml \
  --substitutions=REPO_NAME=$(basename $(git remote get-url origin)),BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD) \
  ..