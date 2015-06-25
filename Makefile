watch:
	./node_modules/gulp/bin/gulp.js watch

build:
	./node_modules/browserify/bin/cmd.js lib/main.js -o src/eventDrops.js

test: karma mocha

karma:
	./node_modules/karma/bin/karma start test/karma/karma.conf.js --single-run

mocha:
	./node_modules/mocha/b/mocha --recursive test/mocha

install:
	npm install