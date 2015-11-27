import filterData from '../filterData';

export const drops = (svg, scales, configuration) => data => {
    const dropsContainer = svg.append('g')
        .classed('drops-container', true)
        .attr("clip-path", "url(#drops-container)");

    const dropLines = dropsContainer.selectAll('.drops').data(data, d => d.name);

    dropLines.enter()
        .append('g')
        .attr('transform', (d, idx) => `translate(10, ${configuration.lineHeight + scales.y(idx)})`)
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
            .attr('fill', 'red');

        drops.exit().remove();
    });

    return dropsContainer;
};
