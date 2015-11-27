export const delimiters = (svg, scales, dateFormat) => {
    const extremum = svg.select('.extremum')

    extremum.select('.minimum').remove();
    extremum.select('.maximum').remove();

    const domain = scales.x.domain();

    extremum.append('text')
        .text(dateFormat(domain[0]))
        .classed('minimum', true);

    extremum.append('text')
        .text(dateFormat(domain[1]))
        .classed('maximum', true)
        .attr('transform', `translate(${scales.x.range()[1] - 200})`)
        .attr('text-anchor', 'end');
};
