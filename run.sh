#!/bin/sh

git pull
rm -rf ./node_modules
npm cache clean --force
npm i
npm run build

docker-compose down 
docker-compose build
docker-compose up -d --force-recreate
