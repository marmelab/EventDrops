import uniqBy from 'lodash.uniqby';
import { withinRange } from './withinRange';

const filterDrops = (xScale, dropDate) => d => {
    const dateBounds = xScale.domain().map(d => new Date(d));
    const withinRangeData = d.data.filter(data =>
        withinRange(dropDate(data), dateBounds)
    );

    const distinctData = uniqBy(withinRangeData, data =>
        Math.round(xScale(dropDate(data)))
    );

    return distinctData;
};

export default (config, xScale) => selection => {
    const {
        drop: {
            color: dropColor,
            radius: dropRadius,
            date: dropDate,
            onClick,
            onMouseOver,
            onMouseOut,
        },
    } = config;

    const drops = selection
        .selectAll('.drop')
        .data(filterDrops(xScale, dropDate));

    drops
        .enter()
        .append('circle')
        .classed('drop', true)
        .attr('fill', dropColor)
        .on('click', onClick)
        .on('mouseover', onMouseOver)
        .on('mouseout', onMouseOut)
        .attr('cx', d => xScale(dropDate(d)))
        .attr('r', 0)
        .transition()
        .duration(500)
        .attr('r', dropRadius);

    drops
        .exit()
        .on('click', null)
        .on('mouseover', null)
        .on('mouseout', null)
        .transition()
        .attr('r', 0)
        .duration(300)
        .remove();
};
