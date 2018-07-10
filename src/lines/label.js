export const labelFactory = config => {
    const {
        d3,
        label: { width: labelWidth, padding: labelPadding, text: labelText },
        line: { height: lineHeight },
    } = config;

    return function() {
        const line = d3.select(this);
        line.select('.label').remove();

        line
            .append('text')
            .classed('label', true)
            .attr('x', labelWidth - labelPadding)
            .attr('y', lineHeight / 2)
            .attr('dy', '0.25em')
            .attr('text-anchor', 'end')
            .text(labelText);
    };
};
