#!/bin/bash

BRANCH=$1
COMMITS=$2

SAFE_BRANCH=$(echo $BRANCH | tr '/' '_')

git checkout $BRANCH || git checkout -b $BRANCH

for i in $(seq 1 $COMMITS)
do
  echo "$BRANCH change $i $(date)" >> dev_${SAFE_BRANCH}.txt

  git add dev_${SAFE_BRANCH}.txt
  git commit -m "$BRANCH commit $i"

  git push origin $BRANCH

  sleep $((RANDOM % 5 + 1))
done
