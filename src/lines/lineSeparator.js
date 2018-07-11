export const lineSeparatorFactory = config => {
    const {
        d3,
        label: { width: labelWidth },
        line: { height: lineHeight },
    } = config;

    return function() {
        const line = d3.select(this);
        line.select('.line-separator').remove();

        line
            .append('line')
            .classed('line-separator', true)
            .attr('x1', 0)
            .attr('x2', '100%')
            .attr('y1', () => lineHeight)
            .attr('y2', () => lineHeight);
    };
};
