import uniqBy from 'lodash.uniqby';

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
            .data(d =>
                uniqBy(d.data, data =>
                    Math.floor(xScale(new Date(data.date)))));

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
