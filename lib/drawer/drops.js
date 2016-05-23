export default (svg, scales, configuration) => function dropsSelector(data) {
    const dropLines = svg.selectAll('.drop-line').data(data);

    dropLines.enter()
        .append('g')
        .classed('drop-line', true)
        .attr('transform', (d, idx) => `translate(10, ${40 + configuration.lineHeight + scales.y(idx)})`)
        .attr('fill', configuration.eventLineColor);

    dropLines.each(function dropLineDraw(drop) {
        const drops = d3.select(this).selectAll('.drop').data(drop.dates);

        drops.attr('cx', d => scales.x(d));

        const circle = drops.enter()
            .append('circle')
            .classed('drop', true)
            .attr('r', 5)
            .attr('cx', d => scales.x(d))
            .attr('cy', -5)
            .attr('fill', configuration.eventColor);

        if (configuration.eventClick) {
            circle.on('click', configuration.eventClick);
        }

        if (configuration.eventHover) {
            circle.on('mouseover', configuration.eventHover);
        }

        // unregister previous event handlers to prevent from memory leaks
        drops.exit()
            .on('click', null)
            .on('mouseover', null);

        drops.exit().remove();
    });

    dropLines.exit().remove();
};
