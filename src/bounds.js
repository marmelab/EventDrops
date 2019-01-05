export default (config, xScale) => selection => {
    const {
        margin,
        bound: { format: dateFormat },
        label: { width: labelWidth },
        line: { height: lineHeight },
    } = config;

    const bounds = selection.selectAll('.bound').data(d => d);
    const numberRows = selection.data()[0].length;

    bounds.exit().remove();

    const boundTextGroup = bounds
        .enter()
        .filter((_, i) => !i)
        .append('g')
        .classed('bound', true)
        .attr(
            'transform',
            `translate(${labelWidth}, ${lineHeight * numberRows + margin.top})`
        );

    boundTextGroup
        .append('text')
        .classed('start', true)
        .text(dateFormat(xScale.domain()[0]));

    boundTextGroup
        .append('text')
        .classed('end', true)
        .attr('x', xScale.range()[1] - margin.right)
        .attr('text-anchor', 'end')
        .text(dateFormat(xScale.domain()[1]));

    bounds.selectAll('.bound text.start').text(dateFormat(xScale.domain()[0]));
    bounds.selectAll('.bound text.end').text(dateFormat(xScale.domain()[1]));
};
