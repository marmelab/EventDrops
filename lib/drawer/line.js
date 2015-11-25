import { drops } from './drops';
import { labels } from './labels';

export const line = function (svg, xScale, yScale, data, eventColor = '#000') {
    var dropElements = svg.selectAll('g').data(data);

    svg.append('g')
        .classed('labels', true)
        .call(labels(xScale));

    dropElements.enter()
        .append('g')
        .classed('line', true)
        .attr('transform', (d) => `translate(0, ${yScale(d.name)})`)
        .call(drops(xScale, eventColor));

    dropElements.exit().remove();
};
