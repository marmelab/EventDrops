import * as d3 from 'd3/build/d3';
import { subYears } from 'date-fns';

import eventDrops from '../src';
import '../src/style.css';
import { gravatar, humanizeDate } from './utils';

const repositories = require('./data.json');
const repositoriesData = repositories.map(repository => ({
    name: repository.name,
    data: repository.commits,
}));

const numberCommitsContainer = document.getElementById('numberCommits');
const zoomStart = document.getElementById('zoomStart');
const zoomEnd = document.getElementById('zoomEnd');

// const updateCommitsInformation = chart => {
//     const filteredData = chart
//         .filteredData()
//         .reduce((total, repo) => total.concat(repo.data), []);

//     numberCommitsContainer.textContent = filteredData.length;
//     zoomStart.textContent = humanizeDate(chart.scale().domain()[0]);
//     zoomEnd.textContent = humanizeDate(chart.scale().domain()[1]);
// };

const randomDateFactory = (minimum, maximum) => () => {
    return new Date(
        minimum.getTime() +
            Math.random() * (maximum.getTime() - minimum.getTime())
    );
};

const randomizeData = () => {
    const randomDate = randomDateFactory(subYears(new Date(), 1), new Date());

    const data = repositoriesData.map(repositoryData => ({
        ...repositoryData,
        data: repositoryData.data.map(datum => ({
            ...datum,
            date: randomDate(),
        })),
    }));

    d3.select('#eventdrops-demo').call(chart.draw([data]));
};

document
    .getElementById('randomize-button')
    .addEventListener('click', randomizeData);

const tooltip = d3
    .select('body')
    .append('div')
    .classed('tooltip', true)
    .style('opacity', 0)
    .style('pointer-events', 'auto');

const chart = eventDrops({
    d3,
    zoom: {
        // onZoomEnd: () => updateCommitsInformation(chart),
    },
    line: {
        key: d => d.name,
    },
    drop: {
        key: d => d.date,
        date: d => new Date(d.date),
        onMouseOver: commit => {
            tooltip
                .transition()
                .duration(200)
                .style('opacity', 1)
                .style('pointer-events', 'auto');

            tooltip
                .html(
                    `
                    <div class="commit">
                    <img class="avatar" src="${gravatar(
                        commit.author.email
                    )}" alt="${commit.author.name}" title="${
                        commit.author.name
                    }" />
                    <div class="content">
                        <h3 class="message">${commit.message}</h3>
                        <p>
                            <a href="https://www.github.com/${
                                commit.author.name
                            }" class="author">${commit.author.name}</a>
                            on <span class="date">${humanizeDate(
                                new Date(commit.date)
                            )}</span> -
                            <a class="sha" href="${
                                commit.sha
                            }">${commit.sha.substr(0, 10)}</a>
                        </p>
                    </div>
                `
                )
                .style('left', `${d3.event.pageX - 30}px`)
                .style('top', `${d3.event.pageY + 20}px`);
        },
        onMouseOut: () => {
            tooltip
                .transition()
                .duration(500)
                .style('opacity', 0)
                .style('pointer-events', 'none');
        },
    },
});

d3
    .select('#eventdrops-demo')
    .data([repositoriesData])
    .call(chart);

// updateCommitsInformation(chart);
