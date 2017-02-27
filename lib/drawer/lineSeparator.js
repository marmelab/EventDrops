export default (axesContainer, scales, configuration, dimensions) => data => {
   console.log('line seperator');
    const separators = axesContainer.selectAll('.line-separator').data(data);

    separators.enter()
        .append('g')
        .classed('line-separator', true)
        .attr('transform', (d, i) => `translate(0, ${scales.y(i) + configuration.lineHeight})`)
        .append('line')
            .attr('x1', 0)
            .attr('x2', dimensions.width);

    separators.exit().remove();
};
