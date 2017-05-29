.PHONY: test

help:
	@grep -P '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

run: ## Run the webpack-dev-server
	./node_modules/webpack-dev-server/bin/webpack-dev-server.js --config webpack.demo.js --hot --inline --colors --host=0.0.0.0

build: install ## Webpack build the project
	./node_modules/webpack/bin/webpack.js --config webpack.lib.js -p --progress --devtool source-map

publish: build ## Publish current version of EventDrops
	npm publish
	$(MAKE) deploy-demo

deploy-demo: ## Deploy the demo at http://marmelab.com/EventDrops/
	./node_modules/webpack/bin/webpack.js --config webpack.demo.js -p --progress
	git add -f demo/
	git commit -m "Update GitHub pages"
	git push origin :gh-pages
	git subtree push --prefix demo/dist origin gh-pages
	git reset --soft HEAD~1 # undo the deployment commit
	git reset HEAD demo
	rm -Rf demo/dist/

test: ## Run unit tests
	./node_modules/.bin/karma start test/karma/karma.conf.js --single-run

test-watch: ## Run unit tests with hot reloading
	./node_modules/.bin/karma start test/karma/karma.conf.js

install: ## Install dependencies
	npm install
