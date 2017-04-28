import * as d3 from 'd3/build/d3';

export default (xScale, configuration, where) => {
    const tickFormat = configuration.locale
        ? configuration.locale.timeFormat
        : configuration.tickFormat;

    //change where so the first letter will be uppercase
    where = `${where[0].toUpperCase()}${where.slice(1)}`;

    const axis = d3[`axis${where}`]().scale(xScale).tickFormat(tickFormat);

    if (typeof configuration.axisFormat === 'function') {
        configuration.axisFormat(axis);
    }

    return axis;
};
