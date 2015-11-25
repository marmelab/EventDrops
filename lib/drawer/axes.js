import xAxis from '../xAxis';
import { drawTopAxis, drawBottomAxis } from './xAxis';

const boolOrReturnValue = (x, data) => typeof x === 'function' ? x(data) : x;

const drawLineSeparators = (container, yScale, configuration, dimensions) => {
    const separators = container.selectAll('g').data(yScale.domain());

    separators.enter()
        .append('g')
        .classed('line-separator', true)
        .attr('transform', (d) => `translate(0, ${yScale(d)})`)
        .append('line')
            .attr('x1', configuration.margin.left)
            .attr('x2', configuration.margin.left + dimensions.width);

    separators.exit().remove();
};

const drawXAxes = function (container, data, dimensions, xScale, configuration) {
    const xAxes = container.selectAll('.x-axis').data(xScale.domain());

    if (boolOrReturnValue(configuration.hasTopAxis, data)) {
        xAxes.enter()
            .append('g')
            .classed('x-axis', true)
            .attr('transform', `translate(${configuration.margin.left}, -40)`)
            .call(xAxis(xScale, configuration, 'top'));
    }

    if (boolOrReturnValue(configuration.hasBottomAxis, data)) {
        xAxes.enter()
            .append('g')
            .classed('x-axis', true)
            .attr('transform', `translate(${configuration.margin.left}, ${+dimensions.height - 40})`)
            .call(xAxis(xScale, configuration, 'bottom'));
    }

    xAxes.exit().remove();
};

export const axes = (svg, scales, configuration, dimensions) => {
    const axesContainer = svg.append('g')
        .classed('axes', true)
        .attr('transform', 'translate(10, 60)');

    return (data) => {
        drawLineSeparators(axesContainer, scales.y, configuration, dimensions);
        drawXAxes(axesContainer, data, dimensions, scales.x, configuration);
    }
};
