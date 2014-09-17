PATH := ${CURDIR}/node_modules/.bin:${CURDIR}/node_modules/karma/bin:${PATH}

karma-test:
	karma start test/karma/karma.conf.js --single-run

mocha-test:
	mocha test/mocha

test: \
	mocha-test \
	karma-test \
