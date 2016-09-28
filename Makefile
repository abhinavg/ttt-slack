.PHONY: test run
.DEFAULT_GOAL := test

node_modules:
	npm install

test: node_modules
	./node_modules/.bin/mocha test

run: node_modules
	./node_modules/.bin/node-dev index.js
