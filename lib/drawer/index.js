import d3 from 'd3';
import { delimiters } from './delimiters';
import filterData from '../filterData';
import { init as initMetaballs } from '../metaballs';

export default function (svg, dimensions, scales, configuration) {
    const defs = svg.append('defs');
    defs.append('svg:clipPath')
        .attr('id', 'drops-container')
            .append('svg:rect')
            .attr('id', 'drops-container-rect')
            .attr('x', configuration.margin.left + 10)
            .attr('y', 0)
            .attr('width', dimensions.width)
            .attr('height', dimensions.outer_height);

    const labelsContainer = svg
        .append('g')
        .classed('labels', true)
        .attr('transform', 'translate(0, 45)');

    const axesContainer = svg.append('g')
        .classed('axes', true)
        .attr('transform', 'translate(210, 55)');

    const dropsContainer = svg.append('g')
        .classed('drops-container', true)
        .style('filter', 'url(#metaballs)');

    const extremaContainer = svg.append('g')
        .classed('extremum', true)
        .attr('width', dimensions.width)
        .attr('height', 30)
        .attr('transform', `translate(${configuration.margin.left}, ${configuration.margin.top - 45})`);

    configuration.metaballs && initMetaballs(defs);

    const lineSeparator = require('./lineSeparator')(axesContainer, scales, configuration, dimensions);
    const axes = require('./axes')(axesContainer, scales, configuration, dimensions);
    const labels = require('./labels')(labelsContainer, scales, configuration);
    const drops = require('./drops')(dropsContainer, scales, configuration);

    return function (data) {
        lineSeparator(data);
        delimiters(svg, scales, configuration.dateFormat);
        drops(data);
        labels(data);
        axes(data);
    };
};
