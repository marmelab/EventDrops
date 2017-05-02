import * as d3 from 'd3/build/d3';

const config = {
    lineHeight: 40,
    start: new Date(0),
    end: new Date(),
    minScale: 0,
    maxScale: Infinity,
    margin: {
        top: 60,
        left: 200,
        bottom: 40,
        right: 50,
    },
    labelsWidth: 210,
    labelsRightMargin: 10,
    locale: null,
    axisFormat: null,
    tickFormat: date => {
        const formatMillisecond = d3.timeFormat('.%L'),
            formatSecond = d3.timeFormat(':%S'),
            formatMinute = d3.timeFormat('%I:%M'),
            formatHour = d3.timeFormat('%I %p'),
            formatDay = d3.timeFormat('%a %d'),
            formatWeek = d3.timeFormat('%b %d'),
            formatMonth = d3.timeFormat('%B'),
            formatYear = d3.timeFormat('%Y');

        //multiFormat(date) {
        return (d3.timeSecond(date) < date
            ? formatMillisecond
            : d3.timeMinute(date) < date
                  ? formatSecond
                  : d3.timeHour(date) < date
                        ? formatMinute
                        : d3.timeDay(date) < date
                              ? formatHour
                              : d3.timeMonth(date) < date
                                    ? d3.timeWeek(date) < date
                                          ? formatDay
                                          : formatWeek
                                    : d3.timeYear(date) < date
                                          ? formatMonth
                                          : formatYear)(date);
        //}
    },
    mouseout: () => {},
    mouseover: () => {},
    zoomend: () => {},
    click: () => {},
    hasDelimiter: true,
    date: d => d,
    hasTopAxis: true,
    hasBottomAxis: d => d.length >= 10,
    eventLineColor: 'black',
    eventColor: null,
    metaballs: true,
    zoomable: true,
    displayedData: () => {},
};

config.dateFormat = config.locale
    ? config.locale.timeFormat('%d %B %Y')
    : d3.timeFormat('%d %B %Y');

export default config;
