PATH := ${CURDIR}/node_modules/.bin:${CURDIR}/node_modules/karma/bin:${PATH}

karma-test:
	karma start test/karma/karma.conf.js --single-run

mocha-test:
	mocha test/mocha

test: \
	mocha-test \
	karma-test \

install:
	npm install

browserify:
	node_modules/browserify/bin/cmd.js lib/main.js -d -p [minifyify --map bundle.map.json --output bundle.map.json] > src/eventDrops.js
