export const drawYAxis = function (svg, yScale, configuration, dimensions) {
    const yAxis = svg.append('g')
        .classed('y-axis', true)
        .attr('transform', 'translate(0, 19)');

    const yTick = yAxis.append('g')
        .selectAll('g')
        .data(yScale.domain());

    yTick.enter()
        .append('g')
        .attr('transform', (d) => `translate(0, ${yScale(d)})`)
        .append('line')
        .classed('y-tick', true)
        .attr('x1', configuration.margin.left)
        .attr('x2', configuration.margin.left + dimensions.width);

    yTick.exit().remove();
};
