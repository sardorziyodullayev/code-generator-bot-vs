CURRENT_DIR=$(shell pwd)

APP=$(shell basename ${CURRENT_DIR})

-include .env

run:
	yarn dev

build-prod-restart:
	git checkout main && \
	git pull origin main && \
	yarn build && \
	cp -ivr $PWD/src/bot/locales $PWD/build/bot/locales && \
	NODE_ENV="production" pm2 restart "code generate" --update-env

docker-prune:

.DEFAULT_GOAL:=run
