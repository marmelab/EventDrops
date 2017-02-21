import d3 from 'd3!';

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
    tickFormat: [
        ['.%L', (d) => d.getMilliseconds()],
        [':%S', (d) => d.getSeconds()],
        ['%I:%M', (d) => d.getMinutes()],
        ['%I %p', (d) => d.getHours()],
        ['%a %d', (d) => d.getDay() && d.getDate() !== 1],
        ['%b %d', (d) => d.getDate() !== 1],
        ['%B', (d) => d.getMonth()],
        ['%Y', () => true],
    ],
    mouseout: () => {},
    mouseover: () => {},
    zoomend: () => {},
    click: () => {},
    hasDelimiter: true,
    date: d => d,
    hasTopAxis: true,
    hasBottomAxis: (d) => d.length >= 10,
    eventLineColor: 'black',
    eventColor: null,
    metaballs: true,
    zoomable: true,
};

config.dateFormat = config.locale ? config.locale.timeFormat('%d %B %Y') : d3.timeParse('%d %B %Y');

module.exports = config;
