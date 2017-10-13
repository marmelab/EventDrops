export default (d3, config, xScale) =>
    selection => {
        const {
            label: {
                width: labelWidth,
            },
        } = config;

        const axis = selection.selectAll('.axis').data(d => d);

        axis.exit().remove();

        axis
            .enter()
            .filter((_, i) => !i)
            .append('g')
            .classed('axis', true)
            .attr('transform', `translate(${labelWidth},0)`)
            .call(d3.axisTop(xScale));

        axis.call(d3.axisTop(xScale));
    };
