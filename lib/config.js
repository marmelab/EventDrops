import d3 from 'd3';

const config = {
    lineHeight: 45,
    start: new Date(0),
    end: new Date(),
    minScale: 0,
    maxScale: Infinity,
    width: 1000,
    margin: {
        top: 60,
        left: 200,
        bottom: 40,
        right: 50,
    },
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
    eventHover: null,
    eventZoom: null,
    eventClick: null,
    hasDelimiter: true,
    hasTopAxis: true,
    hasBottomAxis: (d) => d.length >= 10,
    eventLineColor: 'black',
    eventColor: null,
    absoluteUrl: '',
    metaballs: true,
    zoomable: true,
};

config.dateFormat = config.locale ? config.locale.timeFormat('%d %B %Y') : d3.time.format('%d %B %Y');

module.exports = config;
