import * as d3 from 'd3/build/d3';

import eventDrops from '../src';
import '../src/style.css';
import { humanizeDate } from './utils';

const repositories = require('./data.json');

const numberCommitsContainer = document.getElementById('numberCommits');
const zoomStart = document.getElementById('zoomStart');
const zoomEnd = document.getElementById('zoomEnd');

const updateCommitsInformation = (chart) => {
    const filteredData = chart.filteredData().reduce((total, repo) => total.concat(repo.data), []);

    numberCommitsContainer.textContent = filteredData.length;
    zoomStart.textContent = humanizeDate(chart.scale().domain()[0]);
    zoomEnd.textContent = humanizeDate(chart.scale().domain()[1]);
};

const chart = eventDrops({
    d3,
    config: {
        zoom: {
            onZoomEnd: () => updateCommitsInformation(chart),
        },
    },
});

const repositoriesData = repositories.map(repository => ({
    name: repository.name,
    data: repository.commits,
}));

d3.select('#eventdrops-demo')
    .data([repositoriesData])
    .call(chart);

updateCommitsInformation(chart);
