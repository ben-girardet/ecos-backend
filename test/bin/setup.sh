#!/usr/bin/env bash

sh down.sh

echo "=>  Build"

docker-compose up --remove-orphans -d db
docker-compose up --remove-orphans -d redis
docker-compose build app

echo "=>  Setup"
docker-compose up -d app
