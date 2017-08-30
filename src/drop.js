export default (config, xScale) =>
    selection => {
        const {
            drop: {
                color: dropColor,
                radius: dropRadius,
            },
        } = config;

        const drops = selection.selectAll('.drop').data(d => d.data);

        drops
            .enter()
            .append('circle')
            .classed('drop', true)
            .attr('r', dropRadius)
            .attr('cx', d => xScale(new Date(d.date)))
            .attr('cy', -2.5)
            .attr('fill', dropColor);

        drops.exit().remove();
    };
