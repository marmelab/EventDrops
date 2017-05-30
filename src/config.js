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
    displayLabels: true,
    labelsWidth: 210,
    labelsRightMargin: 10,
    locale: null,
    axisFormat: null,
    tickFormat: date => {
        const formatMillisecond = d3.timeFormat('.%L');
        const formatSecond = d3.timeFormat(':%S');
        const formatMinute = d3.timeFormat('%I:%M');
        const formatHour = d3.timeFormat('%I %p');
        const formatDay = d3.timeFormat('%a %d');
        const formatWeek = d3.timeFormat('%b %d');
        const formatMonth = d3.timeFormat('%B');
        const formatYear = d3.timeFormat('%Y');

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
    },
    mouseout: () => {},
    mouseover: () => {},
    zoomend: () => {},
    click: () => {},
    dblclick: () => {},
    hasDelimiter: true,
    date: d => d,
    hasTopAxis: true,
    hasBottomAxis: d => d.length >= 10,
    eventLineColor: 'black',
    eventColor: null,
    metaballs: true,
    zoomable: true,
};

config.dateFormat = config.locale
    ? config.locale.timeFormat('%d %B %Y')
    : d3.timeFormat('%d %B %Y');

export default config;
