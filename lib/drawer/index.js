import { delimiters } from './delimiters';
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
            .attr('width', dimensions.width)
            .attr('height', dimensions.height + configuration.margin.top + configuration.margin.bottom);

    const labelsContainer = svg
        .append('g')
        .classed('labels', true)
        .attr('transform', `translate(0, ${configuration.lineHeight})`);

    const chartContainer = svg.append('g')
        .attr({
            class: 'chart-wrapper',
            transform: `translate(${configuration.labelsWidth + configuration.labelsRightMargin}, 55)`,
        });

    const axesContainer = chartContainer.append('g').classed('axes', true);

    const dropsContainer = chartContainer.append('g')
        .classed('drops-container', true)
        .attr('clip-path', 'url(#drops-container-clipper)')
        .style('filter', 'url(#metaballs)');

    chartContainer.append('g')
        .classed('extremum', true)
        .attr('width', dimensions.width)
        .attr('height', 30)
        .attr('transform', `translate(0, -35)`);

    if (configuration.metaballs) {
        metaballs(defs);
    }

    const lineSeparator = lineSeparatorFactory(axesContainer, scales, configuration, dimensions);
    const axes = axesFactory(axesContainer, scales, configuration, dimensions);
    const labels = labelsFactory(labelsContainer, scales, configuration);
    const drops = dropsFactory(dropsContainer, scales, configuration);

    return data => {
        lineSeparator(data);
        delimiters(svg, scales, configuration.labelsWidth + configuration.labelsRightMargin, configuration.dateFormat);
        drops(data);
        labels(data, configuration);
        axes(data);
    };
};
