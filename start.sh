#!/bin/bash

# Function to kill background processes on exit
cleanup() {
  echo "Shutting down..."
  # Kill all child processes of this script
  pkill -P $$ 
  exit 0
}

# Trap SIGINT (Ctrl+C)
trap cleanup SIGINT

echo "Starting Meshtasticator Web App (Real Device Mode)..."

# Start Web App
cd web && npm run dev &
PID_WEB=$!

# Wait for process
wait $PID_WEB
