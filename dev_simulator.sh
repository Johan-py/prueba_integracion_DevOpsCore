#!/bin/bash

BRANCH=$1
COMMITS=$2

git checkout $BRANCH

for i in $(seq 1 $COMMITS)
do
  echo "$BRANCH change $i $(date)" >> dev_${BRANCH}.txt
  git add .
  git commit -m "$BRANCH commit $i"
  git push origin HEAD
  sleep $((RANDOM % 5 + 1))
done
