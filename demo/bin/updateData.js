/* eslint-disable no-console */
const async = require('async');
const fs = require('fs');
const exec = require('child_process').exec;

const repositories = [
    { name: 'admin-on-rest', identifier: 'marmelab/admin-on-rest' },
    { name: 'ng-admin', identifier: 'marmelab/ng-admin' },
    { name: 'EventDrops', identifier: 'marmelab/EventDrops' },
    { name: 'javascript-boilerplate', identifier: 'marmelab/javascript-boilerplate' },
    { name: 'sedy', identifier: 'marmelab/sedy' },
    { name: 'restful.js', identifier: 'marmelab/restful.js' },
];

const setup = cb => {
    exec(`mkdir -p /tmp/event-drops`, cb);
};

const clone = (repository, cb) => {
    exec(`git clone https://www.github.com/${repository.identifier} /tmp/event-drops/${repository.name}`, cb);
};

const commitsHistory = (repository, cb) => {
    const command = `cd /tmp/event-drops/${repository.name} && \
    git log --pretty=format:'{\
        "sha": "%H",\
        "message": "%f",\
        "author": {"name": "%aN", "email": "%aE" },\
        "date": "%aD"\
    },'`;


    exec(command, { maxBuffer: 1024 * 2000 }, (err, out) => {
        if (err) {
            cb(err);
        }

        // do not forget to remove final comma
        cb(null, JSON.parse(`[${out.substr(0, out.length - 1)}]`));
    });
};


const writeDataFixtures = (commits, cb) => {
    const data = repositories.map((r, index) => ({
        name: r.name,
        commits: commits[index],
    }));

    fs.writeFile(`${__dirname}/../data.json`, JSON.stringify(data), cb);
};

const clean = cb => {
    exec(`rm -rf /tmp/event-drops`, cb);
};

console.log('Hang on, generating fixtures file may take several minutes...');

async.series([
    clean,
    setup,
    cb => async.map(repositories, clone, cb),
    cb => async.waterfall([
        cb2 => async.map(repositories, commitsHistory, cb2),
        writeDataFixtures,
    ], cb),
    clean,
], err => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    process.exit(0);
});
