export default (config, xScale) =>
    selection => {
        const {
            drop: {
                color: dropColor,
                radius: dropRadius,
            },
        } = config;

        const dateBounds = xScale.domain().map(d => new Date(d));
        const withinRange = d =>
            new Date(d) >= dateBounds[0] && new Date(d) <= dateBounds[1];

        const drops = selection
            .selectAll('.drop')
            .data(repositoryData =>
                repositoryData.data.filter(d => withinRange(d.date)));

        drops
            .enter()
            .append('circle')
            .classed('drop', true)
            .attr('r', dropRadius)
            .attr('cx', d => xScale(new Date(d.date)))
            .attr('fill', dropColor);

        drops.exit().remove();
    };
