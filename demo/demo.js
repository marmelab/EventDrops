const repositories = require('json!./data.json');

const colors = d3.scale.category10();
const [start, end] = d3.extent(repositories[0].commits, d => d.commit.author.date)
    .map(d => new Date(d));

const chart = d3.chart.eventDrops()
    .start(start)
    .end(end)
    .eventLineColor((d, i) => colors(i))
    .date(d => new Date(d.commit.author.date));

const element = d3.select('#eventdrops-demo').datum(repositories.map(repository => ({
    name: repository.name,
    data: repository.commits,
})));

chart(element);
