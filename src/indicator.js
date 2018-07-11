import { isAfter } from './isAfter';
import { isBefore } from './isBefore';

export default (config, xScale, side) => selection => {
    const {
        label: { text: labelText, padding: labelPadding, width: labelWidth },
        line: { color: lineColor, height: lineHeight },
        drop: { date: dropDate },
    } = config;

    const dateBounds = xScale.domain().map(d => new Date(d));

    const indicators = selection.selectAll('.indicator').data(d => {
        const data = [];
        if (d.fullData.some(d => isBefore(dropDate(d), dateBounds))) {
            data.push('before');
        }
        if (d.fullData.some(d => isAfter(dropDate(d), dateBounds))) {
            data.push('after');
        }
        return data;
    });

    indicators
        .enter()
        .append('text')
        .classed('indicator', true)
        .attr('opacity', 0.5)
        .attr('x', d => (d === 'before' ? labelWidth : '100%'))
        .attr('dx', d => (d === 'before' ? 0 : -25))
        .attr('y', lineHeight / 2)
        .attr('dy', '0.25em')
        .text(d => (d === 'before' ? '◀' : '▶'));

    indicators
        .attr('x', d => (d === 'before' ? labelWidth : '100%'))
        .attr('dx', d => (d === 'before' ? 0 : -25))
        .attr('y', lineHeight / 2)
        .attr('dy', '0.25em')
        .text(d => (d === 'before' ? '◀' : '▶'));

    indicators.exit().remove();
};
