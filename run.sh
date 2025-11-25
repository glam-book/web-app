#!/bin/sh

git pull
npm run build

docker-compose down 
docker-compose build --force-recreate
docker-compose up -d
