export const delimiters = (svg, scales, x, dateFormat) => {
    const extremum = svg.select('.extremum');

    extremum.selectAll('.minimum').remove();
    extremum.selectAll('.maximum').remove();

    const domain = scales.x.domain();
    extremum.append('text')
        .text(dateFormat(domain[0]))
        .classed('minimum', true);

    extremum.append('text')
        .text(dateFormat(domain[1]))
        .classed('maximum', true)
        .attr('transform', `translate(${scales.x.range()[1] - x})`)
        .attr('text-anchor', 'end');
};
