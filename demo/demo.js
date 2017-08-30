import * as d3 from 'd3/build/d3';

import eventDrops from '../src';
import '../src/style.css';

const repositories = require('./data.json');
const { gravatar, humanizeDate } = require('./utils');

const colors = d3.schemeCategory10;

const FONT_SIZE = 16; // in pixels
const TOOLTIP_WIDTH = 30; // in rem

// // we're gonna create a tooltip per drop to prevent from transition issues
// const showTooltip = (commit) => {
//     d3.select('body').selectAll('.tooltip').remove();

//     const tooltip = d3
//         .select('body')
//         .append('div')
//         .attr('class', 'tooltip')
//         .style('opacity', 0); // hide it by default

//     const t = d3.transition().duration(250).ease(d3.easeLinear);

//     tooltip
//         .transition(t)
//         .on('start', () => {
//             d3.select('.tooltip').style('display', 'block');
//         })
//         .style('opacity', 1);

//     const rightOrLeftLimit = FONT_SIZE * TOOLTIP_WIDTH;

//     const direction = d3.event.pageX > rightOrLeftLimit ? 'right' : 'left';

//     const ARROW_MARGIN = 1.65;
//     const ARROW_WIDTH = FONT_SIZE;
//     const left = direction === 'right'
//         ? d3.event.pageX - rightOrLeftLimit
//         : d3.event.pageX - ((ARROW_MARGIN * (FONT_SIZE - ARROW_WIDTH)) / 2);

//     tooltip.html(
//         `
//         <div class="commit">
//             <img class="avatar" src="${gravatar(commit.author.email)}" alt="${commit.author.name}" title="${commit.author.name}" />
//             <div class="content">
//                 <h3 class="message">${commit.message}</h3>
//                 <p>
//                     <a href="https://www.github.com/${commit.author.name}" class="author">${commit.author.name}</a>
//                     on <span class="date">${humanizeDate(new Date(commit.date))}</span> -
//                     <a class="sha" href="${commit.sha}">${commit.sha.substr(0, 10)}</a>
//                 </p>
//             </div>
//         </div>
//     `
//     );

//     tooltip
//         .style('left', `${left}px`)
//         .style('top', `${d3.event.pageY + 16}px`)
//         .classed(direction, true);
// };

// const hideTooltip = () => {
//     const t = d3.transition().duration(1000);

//     d3
//         .select('.tooltip')
//         .transition(t)
//         .on('end', function end() {
//             this.remove();
//         })
//         .style('opacity', 0);
// };

// const numberCommits = global.document.getElementById('numberCommits');
// const zoomStart = global.document.getElementById('zoomStart');
// const zoomEnd = global.document.getElementById('zoomEnd');

// const renderStats = (data) => {
//     const newScale = d3.event ? d3.event.transform.rescaleX(chart.scales.x) : chart.scales.x;
//     const filteredCommits = data.reduce((total, repository) => {
//         const filteredRow = chart.visibleDataInRow(repository.data, newScale);
//         return total + filteredRow.length;
//     }, 0);

//     numberCommits.textContent = +filteredCommits;
//     zoomStart.textContent = newScale.domain()[0].toLocaleDateString('en-US');
//     zoomEnd.textContent = newScale.domain()[1].toLocaleDateString('en-US');
// };

const chart = eventDrops();
// const createChart = eventDrops()
//     .start(new Date(new Date().getTime() - (3600000 * 24 * 365))) // one year ago
//     .end(new Date())
//     .eventLineColor((d, i) => colors[i])
//     .date(d => new Date(d.date))
//     // .mouseover(showTooltip)
//     // .mouseout(hideTooltip)
//     // .zoomend(renderStats);

const repositoriesData = repositories.map(repository => ({
    name: repository.name,
    data: repository.commits,
}));

// var matrix = [
//     [11975,  5871, 8916, 2868],
//     [ 1951, 10048, 2060, 6171],
//     [ 8010, 16145, 8090, 8045],
//     [ 1013,   990,  940, 6907]
//   ];

//   var tr = d3.select("body")
//     .append("table")
//     .selectAll("tr")
//     .data(matrix)
//     .enter().append("tr");

//   var td = tr.selectAll("td")
//     .data(function(d) { return d; })
//     .enter().append("td")
//       .text(function(d) { return d; });

d3.select('#eventdrops-demo')
    .datum(repositoriesData)
    .call(chart);
//     .enter()
//     .append('g');
// console.log(lines.data())
// lines.selectAll('.drop-line')
//     .data(d => d)
//     .enter()
//         .append('text')
//         .text(d => d.name);
    // .call(chart);

// renderStats(repositoriesData);
