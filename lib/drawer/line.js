import { drops } from './drops';
import { labels } from './labels';

export const line = (svg, xScale, yScale, data, eventColor = '#000') => {
    let dropElements = svg.selectAll('g').data(data);

    dropElements.enter()
        .append('g')
        .classed('line', true)
        .attr('transform', (d) => `translate(0, ${yScale(d.name)})`)
        .call(drops(xScale, eventColor));

    dropElements.exit().remove();
};
