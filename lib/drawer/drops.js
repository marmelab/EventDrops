import filterData from '../filterData';

export default (svg, scales, configuration) => function (data) {
    const dropLines = svg.selectAll('.drop-line').data(data);

    dropLines.enter()
        .append('g')
        .classed('drop-line', true)
        .attr('transform', (d, idx) => `translate(10, ${40 + configuration.lineHeight + scales.y(idx)})`)
        .attr('fill', configuration.eventLineColor);

    dropLines.each(function (drop) {
        const drops = d3.select(this).selectAll('.drop').data(drop.dates);

        drops.attr('cx', d => scales.x(d) + 200)

        drops.enter()
            .append('circle')
            .classed('drop', true)
            .attr('r', 5)
            .attr('cx', d => scales.x(d) + 200)
            .attr('cy', -5)
            .attr('fill', configuration.eventColor);

        drops.exit().remove();
    });

    dropLines.exit().remove();
};
