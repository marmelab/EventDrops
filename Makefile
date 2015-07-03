watch:
	./node_modules/watchify/bin/cmd.js lib/main.js -dv -o src/eventDrops.js

build:
	./node_modules/browserify/bin/cmd.js lib/main.js -o src/eventDrops.js

test: karma mocha

karma:
	./node_modules/karma/bin/karma start test/karma/karma.conf.js --single-run

mocha:
	./node_modules/mocha/bin/mocha --compilers js:mocha-traceur --recursive test/mocha

install:
	npm install
