/* eslint-disable no-console */
const async = require('async');
const fs = require('fs');
const exec = require('child_process').exec;

const repositories = [
    { name: 'react-admin', identifier: 'marmelab/react-admin' },
    { name: 'JSONGraphQLServer', identifier: 'marmelab/json-graphql-server' },
    { name: 'FakeREST', identifier: 'marmelab/FakeRest' },
    { name: 'Awesome_REST', identifier: 'marmelab/awesome-rest' },
];

const setup = cb => {
    exec(`mkdir -p /tmp/event-drops`, cb);
};

const clone = (repository, cb) => {
    exec(
        `git clone https://www.github.com/${
            repository.identifier
        } /tmp/event-drops/${repository.name}`,
        cb
    );
};

const twoYearsAgo = new Date();
twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

const commitsHistory = (repository, cb) => {
    const command = `cd /tmp/event-drops/${repository.name} && \
    git log --since="${twoYearsAgo.toISOString()}" --pretty=format:'{\
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
        out = out.substr(0, out.length - 1);
        out = out.replace('\\', '\\\\');

        cb(null, JSON.parse(`[${out}]`));
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

async.series(
    [
        clean,
        setup,
        cb => async.map(repositories, clone, cb),
        cb =>
            async.waterfall(
                [
                    cb2 => async.map(repositories, commitsHistory, cb2),
                    writeDataFixtures,
                ],
                cb
            ),
        clean,
    ],
    err => {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        process.exit(0);
    }
);
