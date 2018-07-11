import { isBefore } from '../isBefore';
import { isAfter } from '../isAfter';

export const indicatorsFactory = (config, xScale) => {
    const {
        label: { width: labelWidth },
        line: { height: lineHeight },
        drop: { date: dropDate },
        indicator: { previousText, nextText },
    } = config;

    return function(selection) {
        const dateBounds = xScale.domain().map(d => new Date(d));

        const indicators = selection.selectAll('.indicator').data(d => {
            const data = [];
            if (
                d.fullData.some(event => isBefore(dropDate(event), dateBounds))
            ) {
                data.push('before');
            }
            if (
                d.fullData.some(event => isAfter(dropDate(event), dateBounds))
            ) {
                data.push('after');
            }
            return data;
        });

        const enteringIndicators = indicators.enter();

        enteringIndicators
            .append('text')
            .classed('indicator', true)
            .attr('opacity', 0.5)
            .attr('x', d => (d === 'before' ? labelWidth : '100%'))
            .attr('dx', d => (d === 'before' ? 0 : -25))
            .attr('y', lineHeight / 2)
            .attr('dy', '0.25em')
            .text(d => (d === 'before' ? previousText : nextText));

        // indicators
        //     .attr('x', d => (d === 'before' ? labelWidth : '100%'))
        //     .attr('dx', d => (d === 'before' ? 0 : -25))
        //     .attr('y', lineHeight / 2)
        //     .attr('dy', '0.25em')
        //     .text(d => (d === 'before' ? previousText : nextText));

        // indicators.exit().remove();
    };
};
