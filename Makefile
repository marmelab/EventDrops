.PHONY: test

help:
	@grep -P '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

run: ## Run the webpack-dev-server
	./node_modules/webpack-dev-server/bin/webpack-dev-server.js --config webpack.demo.js --hot --inline --colors --host=0.0.0.0

build: install ## Webpack build the project
	rm -rf dist/
	mkdir -p dist
	./node_modules/.bin/rollup -c

publish: build ## Publish current version of EventDrops (need to set a VERSION=[major|minor|patch])
ifndef VERSION
$(error VERSION is not set. Should be of one of the following values: major, minor, patch)
endif
	npm version ${VERSION}
	git push --tags
	npm publish
	$(MAKE) deploy-demo

deploy-demo: build ## Deploy the demo at http://marmelab.com/EventDrops/
	./node_modules/webpack/bin/webpack.js --config webpack.demo.js -p --progress
	cd demo/dist && \
	git init && \
	git add . && \
	git commit -m "Update demo" && \
	git remote add origin git@github.com:marmelab/EventDrops.git && \
	git push --force origin master:gh-pages
	rm -Rf demo/dist

test: ## Run unit tests
	BABEL_ENV=test ./node_modules/.bin/jest --env=jsdom

test-watch:
	BABEL_ENV=test ./node_modules/.bin/jest --watch --env=jsdom

install: ## Install dependencies
	npm install
