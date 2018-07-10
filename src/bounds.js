export default (config, xScale) => {
    const {
        d3,
        margin,
        bound: { format: dateFormat },
        label: { width: labelWidth },
        line: { height: lineHeight },
    } = config;

    return function(viewport) {
        const numberRows = viewport.data()[0].length;

        viewport.selectAll('.bound').remove();

        viewport
            .append('g')
            .classed('bound', true)
            .classed('start', true)
            .attr(
                'transform',
                `translate(${labelWidth}, ${lineHeight * numberRows +
                    margin.top})`
            )
            .append('text')
            .text(dateFormat(xScale.domain()[0]));

        viewport
            .append('g')
            .classed('bound', true)
            .classed('end', true)
            .attr(
                'transform',
                `translate(${labelWidth}, ${lineHeight * numberRows +
                    margin.top})`
            )
            .append('text')
            .attr('x', xScale.range()[1] - margin.right)
            .attr('text-anchor', 'end')
            .text(dateFormat(xScale.domain()[1]));
    };
};
