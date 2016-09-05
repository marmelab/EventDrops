const fs = require('fs');
require('isomorphic-fetch');

const repositories = [
    { name: 'ng-admin', identifier: 'marmelab/ng-admin' },
    { name: 'EventDrops', identifier: 'marmelab/EventDrops' },
    { name: 'javascript-boilerplate', identifier: 'marmelab/javascript-boilerplate' },
];

const promises = repositories.map(repository => {
    return fetch(`https://api.github.com/repos/${repository.identifier}/commits`)
        .then(response => {
            if (response.status >= 400) {
                console.error(`Unable to retrieve commits for "${repository.name}" repository (response ${response.status}).`);
            }

            return response.json();
        })
        .then(commits => {
            repository.commits = commits;
        })
        .catch(console.err);
});

Promise.all(promises)
    .then(() => {
        fs.writeFile(__dirname + '/../data.json', JSON.stringify(repositories), err => {
            if (err) {
                console.error(`Unable to write "data.json" file.`);
                return;
            }

            console.log('Successfully updated data fixtures.');
        });
    });
