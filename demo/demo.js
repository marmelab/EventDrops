const repositories = require('json!./data.json');

const colors = d3.scale.category10();
const [start, end] = d3.extent(repositories[0].commits, d => d.commit.author.date)
    .map(d => new Date(d));

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
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0); // hide it by default

    // show the tooltip with a small animation
    tooltip.transition()
        .duration(200)
        .each('start', function () {
            d3.select(this).style('block');
        })
        .style('opacity', 1);

    const rightOrLeftLimit = FONT_SIZE * TOOLTIP_WIDTH;
    const direction = d3.event.pageX > rightOrLeftLimit ? 'right' : 'left';

    const ARROW_MARGIN = 1.65;
    const ARROW_WIDTH = FONT_SIZE;
    const left = direction === 'right' ?
        d3.event.pageX - rightOrLeftLimit:
        d3.event.pageX - ARROW_MARGIN * FONT_SIZE - ARROW_WIDTH / 2;


    tooltip.html(`
            <div class="commit">
                <img class="avatar" src="${commit.author.avatar_url}" alt="${commit.author.login}" title="${commit.author.login}" />
                <h3 class="message">${commit.commit.message}</h3>
                <p>
                    By <a href="${commit.author.html_url}" class="author">${commit.author.login}</a>
                    on <span class="date">${humanizeDate(new Date(commit.commit.author.date))}</span><br />
                    <a class="sha" href="${commit.html_url}">${commit.sha}</a>
                </p>
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
        .each('end', function () {
            this.remove();
        })
        .style('opacity', 0);
};

const chart = d3.chart.eventDrops()
    .start(start)
    .end(end)
    .eventLineColor((d, i) => colors(i))
    .date(d => new Date(d.commit.author.date))
    .mouseover(showTooltip)
    .mouseout(hideTooltip);

const element = d3.select('#eventdrops-demo').datum(repositories.map(repository => ({
    name: repository.name,
    data: repository.commits,
})));

chart(element);
