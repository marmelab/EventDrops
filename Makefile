.PHONY: test

help:
	@grep -P '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

run: ## Run the webpack-dev-server
	./node_modules/webpack-dev-server/bin/webpack-dev-server.js --colors --host=0.0.0.0

build: ## Webpack build the project
	./node_modules/webpack/bin/webpack.js -p --optimize-minimize --optimize-occurence-order --optimize-dedupe --progress --devtool source-map

deploy-demo: build ## Deploy the demo at http://marmelab.com/EventDrops/
	mkdir -p demo/dist/
	cp ./dist/* demo/dist/
	cp ./node_modules/d3/d3.min.js demo/dist/
	git add demo/
	git commit -m "Update GitHub pages"
	git push origin :gh-pages
	git subtree push --prefix demo origin gh-pages
	git reset --soft HEAD~1 # undo the deployment commit
	git reset HEAD demo
	rm -Rf demo/dist/

test: ## Run unit tests
	./node_modules/.bin/karma start test/karma/karma.conf.js --single-run

test-watch: ## Run unit tests with hot reloading
	./node_modules/.bin/karma start test/karma/karma.conf.js

install: ## Install dependencies
	npm install
