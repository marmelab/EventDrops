import filterData from '../filterData';

export const drops = (xScale, eventColor) => (
    (selection) => {
        // @TODO: remove (?) the [0]
        selection[0].forEach((line) => {
            const circleContainer = d3.select(line);
                // .style('filter', 'url(#metaball)');

            const circles = circleContainer.selectAll('circle').data((d) => {
                return filterData(d.dates, xScale);
            });

            circles.enter()
                .append('circle')
                .attr('cx', (d) => xScale(d) + 200)
                .style('fill', eventColor)
                .attr('cy', -5)
                .attr('r', 5);

            circles.exit().remove();
        });
    }
);
