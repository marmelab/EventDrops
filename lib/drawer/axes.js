import xAxis from '../xAxis';

const boolOrReturnValue = (x, data) => typeof x === 'function' ? x(data) : x;

export default (axesContainer, scales, configuration, dimensions) => data => {


    const axis = orientation => {
        const selection = axesContainer.selectAll(`.x-axis.${orientation}`).data([{}]);

        const resolvedXAxis = configuration.customXAxis ?
            configuration.customXAxis.xAxis(orientation, dimensions.width)
            : xAxis(scales.x, configuration, orientation);

        selection.enter()
            .append('g')
            .classed('x-axis', true)
            .classed(orientation, true)
            .call(resolvedXAxis)
            .attr('transform', `translate(0,${orientation === 'bottom' ? dimensions.height : 0})`);

        selection.call(resolvedXAxis);

        selection.exit().remove();
    };

    if (boolOrReturnValue(configuration.hasTopAxis, data)) {
        axis('top');
    }

    if (boolOrReturnValue(configuration.hasBottomAxis, data)) {
        axis('bottom');
    }
};
