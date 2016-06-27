import xAxis from '../xAxis';

const boolOrReturnValue = (x, data) => typeof x === 'function' ? x(data) : x;

export default (axesContainer, scales, configuration, dimensions) => data => {
    const axis = orientation => {
        const selection = axesContainer.selectAll(`.x-axis.${orientation}`).data([{}]);

        selection.enter()
            .append('g')
            .classed('x-axis', true)
            .classed(orientation, true)
            .call(xAxis(scales.x, configuration, orientation))
            .attr('transform', `translate(0,${orientation === 'bottom' ? dimensions.height : 0})`);

        selection.call(xAxis(scales.x, configuration, orientation));

        selection.exit().remove();
    };

    if (boolOrReturnValue(configuration.hasTopAxis, data)) {
        axis('top');
    }

    if (boolOrReturnValue(configuration.hasBottomAxis, data)) {
        axis('bottom');
    }
};
