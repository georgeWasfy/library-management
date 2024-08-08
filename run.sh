#!/bin/bash
set -e

npm run db:migrate & PID=$!
# Wait for migration to finish
wait $PID

echo "Starting production server..."
npm run start & PID=$!

wait $PID