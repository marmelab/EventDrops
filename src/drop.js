import uniqBy from 'lodash.uniqby';

export const filterOverlappingDrop = xScale =>
    d => uniqBy(d.data, data => Math.round(xScale(new Date(data.date))));

export default (config, xScale) =>
    selection => {
        const {
            drop: {
                color: dropColor,
                radius: dropRadius,
            },
        } = config;

        const drops = selection
            .selectAll('.drop')
            .data(filterOverlappingDrop(xScale));

        drops
            .enter()
            .append('circle')
            .classed('drop', true)
            .attr('r', dropRadius)
            .attr('fill', dropColor)
            .merge(drops)
            .attr('cx', d => xScale(new Date(d.date)));

        drops.exit().remove();
    };
