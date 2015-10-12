import xAxis from '../xAxis';

const drawAxis = function (svg, xScale, configuration, orientation, y) {
    svg.append('g')
        .classed('x-axis', true)
        .classed(orientation, true)
        .attr('transform', `translate(${configuration.margin.left}, ${y})`)
        .call(xAxis(xScale, configuration, orientation));
};

export const drawTopAxis = (svg, xScale, configuration, dimensions) => drawAxis(svg, xScale, configuration, 'top', configuration.margin.top - 40);
export const drawBottomAxis = (svg, xScale, configuration, dimensions) => drawAxis(svg, xScale, configuration, 'bottom', +dimensions.height - 21);
