import defaultConfiguration from './config';
import dropLine from './dropLine';

import './style.css';

export default (config = defaultConfiguration) =>
    selection => {
        const { lineHeight, margin } = config;

        // Follow margins conventions (https://bl.ocks.org/mbostock/3019563)
        const width = selection.node().clientWidth - margin.left - margin.right;
        const height = selection.data()[0].length * lineHeight -
            margin.top -
            margin.bottom;

        const svg = selection
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .classed('event-drops-chart', true);

        const xScale = d3
            .scaleTime()
            .domain([config.range.start, config.range.end])
            .range([0, width]);

        svg.call(dropLine(config, xScale));
    };
