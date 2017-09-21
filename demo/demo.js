import * as d3 from 'd3/build/d3';

import eventDrops from '../src';
import '../src/style.css';

const repositories = require('./data.json');

const chart = eventDrops();

const repositoriesData = repositories.map(repository => ({
    name: repository.name,
    data: repository.commits,
}));

d3.select('#eventdrops-demo')
    .data([repositoriesData])
    .call(chart);
