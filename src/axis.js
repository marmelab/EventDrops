import { timeFormat } from 'd3-time-format';

export const tickFormat = (date, formats, d3) => {
    if (d3.timeSecond(date) < date) {
        return d3.timeFormat(formats.milliseconds)(date);
    }

    if (d3.timeMinute(date) < date) {
        return d3.timeFormat(formats.seconds)(date);
    }

    if (d3.timeHour(date) < date) {
        return d3.timeFormat(formats.minutes)(date);
    }

    if (d3.timeDay(date) < date) {
        return d3.timeFormat(formats.hours)(date);
    }

    if (d3.timeMonth(date) < date) {
        if (d3.timeWeek(date) < date) {
            return d3.timeFormat(formats.days)(date);
        }

        return d3.timeFormat(formats.weeks)(date);
    }

    if (d3.timeYear(date) < date) {
        return d3.timeFormat(formats.months)(date);
    }

    return d3.timeFormat(formats.year)(date);
};

export default (d3, config, xScale) => {
    const { label: { width: labelWidth }, axis: { formats }, locale } = config;
    d3.timeFormatDefaultLocale(locale);
    return selection => {
        const axis = selection.selectAll('.axis').data(d => d);

        axis.exit().remove();

        const axisTop = d3
            .axisTop(xScale)
            .tickFormat(d => tickFormat(d, formats, d3));

        axis
            .enter()
            .filter((_, i) => !i)
            .append('g')
            .classed('axis', true)
            .attr('transform', `translate(${labelWidth},0)`)
            .call(axisTop);

        axis.call(axisTop);
    };
};
