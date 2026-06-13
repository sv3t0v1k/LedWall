#!/bin/bash
set -e

cd /home/hs/genmap

# Pull latest code
git pull origin main

# Rebuild and restart container
docker compose build
docker compose up -d

echo "$(date): GenMap updated successfully" >> /home/hs/genmap/update.log
