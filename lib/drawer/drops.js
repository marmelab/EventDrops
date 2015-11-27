import filterData from '../filterData';

export const drops = (svg, scales, configuration) => data => {
    const dropLines = svg.selectAll('.drops').data(data, d => d.name);

    dropLines.enter()
        .append('g')
        .attr('transform', (d, idx) => `translate(10, ${40 + configuration.lineHeight + scales.y(idx)})`)
        .attr('fill', configuration.eventLineColor)
        .classed('drops', true);

    dropLines.exit().remove();

    dropLines[0].forEach(line => {
        const drops = d3.select(line)
            .selectAll('.drop')
            .data(d => filterData(d.dates, scales.x), d => d.getTime());

        drops.enter()
            .append('circle')
            .classed('drop', true)
            .attr('r', 5)
            .attr('cx', d => scales.x(d) + 200)
            .attr('cy', -5)
            .attr('fill', configuration.eventColor);

        drops.exit().remove();
    });
};
