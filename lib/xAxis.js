import * as d3 from 'd3-webpack-loader!';

export default function(xScale, configuration, where) {
    const tickFormatData = configuration.tickFormat.map(t => t.slice(0));
    const tickFormat = configuration.locale ? configuration.locale.timeFormat.multi(tickFormatData) : d3.scaleTime(tickFormatData);



    const axis = d3[`axis${where}`]()
        .scale(xScale)
        .tickFormat(tickFormat);

    if (typeof configuration.axisFormat === 'function') {
        configuration.axisFormat(axis);
    }

    return axis;
}
