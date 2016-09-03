const repositories = [{
    name: 'EventDrops',
    data: require('json!./data.json'),
}, {
    name: 'ng-admin',
    data: require('json!./data.json'),
}];

const colors = d3.scale.category10();
const [start, end] = d3.extent(repositories[0].data, d => d.commit.author.date)
    .map(d => new Date(d));

const chart = d3.chart.eventDrops()
    .start(start)
    .end(end)
    .eventLineColor(() => colors(0))
    .date(d => new Date(d.commit.author.date));

const element = d3.select('#eventdrops-demo').datum(repositories);
chart(element);
