#!/bin/bash
# Polling loop for plan/new/ directory
# When a plan file appears, copies it to plan/current_plan.md,
# moves original to plan/testing/, then exits so agent can implement.

NEW_DIR="$(dirname "$0")/new"
TESTING_DIR="$(dirname "$0")/testing"
CURRENT_PLAN="$(dirname "$0")/current_plan.md"
MARKER="$(dirname "$0")/.plan_ready"

while true; do
  plan_file=$(ls -1 "$NEW_DIR" 2>/dev/null | head -1)
  if [ -n "$plan_file" ]; then
    echo "[$(date)] Found plan: $plan_file"
    cp "$NEW_DIR/$plan_file" "$CURRENT_PLAN"
    mv "$NEW_DIR/$plan_file" "$TESTING_DIR/$plan_file"
    touch "$MARKER"
    echo "[$(date)] Plan moved to testing/. Ready for implementation."
    exit 0
  else
    echo "[$(date)] No new plans. Sleeping 5 min..."
    sleep 300
  fi
done
