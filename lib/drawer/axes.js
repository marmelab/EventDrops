import xAxis from '../xAxis';
import { drawTopAxis, drawBottomAxis } from './xAxis';

const boolOrReturnValue = (x, data) => typeof x === 'function' ? x(data) : x;

export default (axesContainer, scales, configuration, dimensions) => data => {
    const xAxes = axesContainer.selectAll('.x-axis').data(data);

    if (boolOrReturnValue(configuration.hasTopAxis, data)) {
        xAxes.enter()
            .append('g')
            .classed('x-axis', true)
            .call(xAxis(scales.x, configuration, 'top'));
    }

    if (boolOrReturnValue(configuration.hasBottomAxis, data)) {
        xAxes.enter()
            .append('g')
            .classed('x-axis', true)
            .attr('transform', `translate(0, ${+dimensions.height - 50})`)
            .call(xAxis(scales.x, configuration, 'bottom'));
    }

    xAxes.exit().remove();
};
