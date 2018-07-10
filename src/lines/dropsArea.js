import drop from '../drop';

export const dropsAreaFactory = (config, xScale) => {
    const {
        d3,
        label: { width: labelWidth },
        line: { height: lineHeight },
        metaballs,
    } = config;

    return function(selection) {
        // @TODO: find why there is no data here
        const areas = selection.selectAll('.drops').data(d => d);
        console.log(areas.data());
        areas.exit().remove();

        const enteringAreas = areas.enter();

        enteringAreas
            .append('g')
            .classed('drops', true)
            .attr(
                'transform',
                () => `translate(${labelWidth}, ${lineHeight / 2})`
            );
        // .call(drop(config, xScale));

        if (metaballs) {
            enteringAreas.style('filter', 'url(#metaballs)');
        }
    };
};
