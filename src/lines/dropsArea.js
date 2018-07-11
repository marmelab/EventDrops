import drop from '../drop';

export const dropsAreaFactory = (config, xScale) => {
    const {
        d3,
        label: { width: labelWidth, padding: labelPadding },
        line: { height: lineHeight },
        metaballs,
    } = config;

    return function() {
        const area = d3.select(this);

        area.select('.drops').remove();

        area
            .append('g')
            .classed('drops', true)
            .attr('transform', d => `translate(0, ${lineHeight / 2})`)
            .call(drop(config, xScale));

        if (metaballs) {
            area.style('filter', 'url(#metaballs)');
        }
    };
};
