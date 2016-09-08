.PHONY: test

help:
	@grep -P '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

run: ## Run the webpack-dev-server
	./node_modules/webpack-dev-server/bin/webpack-dev-server.js --hot --inline --colors --host=0.0.0.0

build: ## Webpack build library
	./node_modules/webpack/bin/webpack.js -p \
		--optimize-minimize \
		--optimize-occurence-order \
		--optimize-dedupe \
		--progress \
		--config ./webpack/event-drops.js \
		--devtool source-map

build-demo:
	./node_modules/webpack/bin/webpack.js -p \
		--optimize-minimize \
		--optimize-occurence-order \
		--optimize-dedupe \
		--progress \
		--config ./webpack/demo.js \
		--devtool source-map

deploy-demo: build-demo ## Deploy the demo at http://marmelab.com/EventDrops/
	git add dist/demo/
	git commit -m "Update GitHub pages"
	git push origin :gh-pages
	git subtree push --prefix dist/demo origin gh-pages
	git reset --soft HEAD~1 # undo the deployment commit
	rm -Rf dist/demo/

test: ## Run unit tests
	./node_modules/.bin/karma start test/karma/karma.conf.js --single-run

test-watch: ## Run unit tests with hot reloading
	./node_modules/.bin/karma start test/karma/karma.conf.js

install: ## Install dependencies
	npm install
