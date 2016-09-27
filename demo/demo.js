const md5 = require('./md5');
const repositories = require('json!./data.json');

const colors = d3.scale.category10();
const gravatar = email => `https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}`;

// September 4 1986 8:30 PM
const humanizeDate = date => {
    const monthNames = [
        'Jan.', 'Feb.', 'March', 'Apr.', 'May', 'June',
        'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.',
    ];

    return `
        ${monthNames[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}
        ${date.getHours()}:${date.getMinutes()}
    `;
};

const FONT_SIZE = 16; // in pixels
const TOOLTIP_WIDTH = 30; // in rem

// we're gonna create a tooltip per drop to prevent from transition issues
const showTooltip = commit => {
    d3.select('body').selectAll('.tooltip').remove();

    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0); // hide it by default

    // show the tooltip with a small animation
    tooltip.transition()
        .duration(200)
        .each('start', function start() {
            d3.select(this).style('block');
        })
        .style('opacity', 1);

    const rightOrLeftLimit = FONT_SIZE * TOOLTIP_WIDTH;
    const direction = d3.event.pageX > rightOrLeftLimit ? 'right' : 'left';

    const ARROW_MARGIN = 1.65;
    const ARROW_WIDTH = FONT_SIZE;
    const left = direction === 'right' ?
        d3.event.pageX - rightOrLeftLimit :
        d3.event.pageX - ARROW_MARGIN * FONT_SIZE - ARROW_WIDTH / 2;

    tooltip.html(`
            <div class="commit">
                <img class="avatar" src="${gravatar(commit.author.email)}" alt="${commit.author.name}" title="${commit.author.name}" />
                <div class="content">
                    <h3 class="message">${commit.message}</h3>
                    <p>
                        <a href="https://www.github.com/${commit.author.name}" class="author">${commit.author.name}</a>
                        on <span class="date">${humanizeDate(new Date(commit.date))}</span> -
                        <a class="sha" href="${commit.sha}">${commit.sha.substr(0, 10)}</a>
                    </p>
                </div>
            </div>
        `)
        .classed(direction, true)
        .style({
            left: `${left}px`,
            top: (d3.event.pageY + 16) + 'px',
        });
};

const hideTooltip = () => {
    d3.select('.tooltip').transition()
        .duration(200)
        .each('end', function end() {
            this.remove();
        })
        .style('opacity', 0);
};

// Convert an absolute time to a time relative to the epoch.
function toRelative(absolute) {
  return new Date(absolute - epoch);
}
// Convert a time relative to the epoch to an absolute time.
function toAbsolute(relative) {
  return new Date(+relative + +epoch);
}
const pad = d3.format("02d");
const oneYearAgo = new Date(new Date().getTime() - 3600000 * 24 * 365);
const epoch = Date.UTC(oneYearAgo.getFullYear(), oneYearAgo.getMonth(), oneYearAgo.getDay(), oneYearAgo.getHours(), oneYearAgo.getMinutes(), oneYearAgo.getSeconds());
const relativeTime = absolute => {

    var delta = absolute - epoch;
  if (!delta) return "0";
  var milliseconds = Math.abs(delta);
  return (delta < 0 ? "-" : "+")
      + Math.floor(milliseconds / 6e4) + ":"
      + pad(Math.floor(milliseconds % 6e4 / 1e3));
};

const xScale = (width) => {
    return d3.time.scale.utc()
        .domain([epoch, d3.time.year.utc.offset(epoch, +2)])
        .range([0, width]);
};

const xAxis = (where, width) => {

    const scale = xScale(width);
    return d3.svg.axis()
        .scale(scale)
        .orient(where)
        .tickFormat(relativeTime)
        .tickValues(d3.time.scale.utc() // Compute ticks relative to epoch.
            .domain(scale.domain().map(toRelative))
            .ticks(5)
            .map(toAbsolute));
};

const getUtcDate = (date) => {
    const rawDate = new Date(date);
    return Date.UTC(rawDate.getFullYear(),
        rawDate.getMonth(),
        rawDate.getDay(),
        rawDate.getHours(),
        rawDate.getMinutes(),
        rawDate.getSeconds());
};

const chart = d3.chart.eventDrops()
    .eventLineColor((d, i) => colors(i))
    .date(d => getUtcDate(d.date))
    .mouseover(showTooltip)
    .mouseout(hideTooltip)
    .customXAxis({xAxis, xScale});

const element = d3.select('#eventdrops-demo').datum(repositories.map(repository => ({
    name: repository.name,
    data: repository.commits,
})));

chart(element);
