#!/bin/sh

git pull
npm run build

docker-compose down
docker-compose build
docker-compose up -d
