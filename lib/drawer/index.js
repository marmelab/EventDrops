import d3 from 'd3';
import { delimiters } from './delimiters';
import filterData from '../filterData';
import { metaballs } from '../metaballs';
import axesFactory from './axes';
import dropsFactory from './drops';
import labelsFactory from './labels';
import lineSeparatorFactory from './lineSeparator';

export default (svg, dimensions, scales, configuration) => {
    const defs = svg.append('defs');
    defs.append('clipPath')
        .attr('id', 'drops-container-clipper')
        .append('rect')
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
        .attr('clip-path', `url(${configuration.absoluteUrl}#drops-container-clipper)`)
        .style('filter', `url(${configuration.absoluteUrl}#metaballs)`);

    const extremaContainer = svg.append('g')
        .classed('extremum', true)
        .attr('width', dimensions.width)
        .attr('height', 30)
        .attr('transform', `translate(${configuration.margin.left}, ${configuration.margin.top - 45})`);

    configuration.metaballs && metaballs(defs);

    const lineSeparator = lineSeparatorFactory(axesContainer, scales, configuration, dimensions);
    const axes = axesFactory(axesContainer, scales, configuration, dimensions);
    const labels = labelsFactory(labelsContainer, scales, configuration);
    const drops = dropsFactory(dropsContainer, scales, configuration);

    return data => {
        lineSeparator(data);
        delimiters(svg, scales, configuration.dateFormat);
        drops(data);
        labels(data);
        axes(data);
    };
};
