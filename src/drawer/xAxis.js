import xAxis from '../xAxis';

const drawAxis = (container, xScale, configuration, orientation, y) => {
    return container
        .append('g')
        .classed('x-axis', true)
        .classed(orientation, true)
        .attr('transform', `translate(0, ${y})`)
        .call(xAxis(xScale, configuration, orientation));
};

export const drawTopAxis = (container, xScale, configuration, dimensions) =>
    drawAxis(container, xScale, configuration, 'top', 0);

export const drawBottomAxis = (container, xScale, configuration, dimensions) =>
    drawAxis(
        container,
        xScale,
        configuration,
        'bottom',
        +dimensions.height - 41
    );

export const boolOrReturnValue = (x, data) =>
    typeof x === 'function' ? x(data) : x;

