import filterData from '../filterData';

export const labels = (xScale) => ((selection) => {
    // @TODO: remove (?) the [0]
    selection[0].forEach((line) => {
        d3.select(line).selectAll('text').remove();

        d3.select(line).append('text')
            .text((d) => {
                const count = filterData(d.dates, xScale).length;
                return d.name + (count > 0 ? ' (' + count + ')' : '');
            })
            .attr('transform', `translate(180, 0)`)
            .attr('text-anchor', 'end')
            .style('fill', 'black');
    });
});
