import enLocale from 'd3-time-format/locale/en-US.json';

export default d3 => ({
    locale: enLocale,
    metaballs: {
        blurDeviation: 10,
        colorMatrix: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 50 -10',
    },
    bound: {
        format: d3.timeFormat('%d %B %Y'),
    },
    axis: {
        formats: {
            milliseconds: '%L',
            seconds: ':%S',
            minutes: '%I:%M',
            hours: '%I %p',
            days: '%a %d',
            weeks: '%b %d',
            months: '%B',
            year: '%Y',
        },
    },
    drop: {
        color: null,
        radius: 5,
        date: d => new Date(d),
        onClick: () => {},
        onMouseOver: () => {},
        onMouseOut: () => {},
    },
    label: {
        padding: 20,
        text: d => `${d.name} (${d.data.length})`,
        width: 200,
    },
    line: {
        color: (_, index) => d3.schemeCategory10[index],
        height: 40,
    },
    margin: {
        top: 20,
        right: 10,
        bottom: 20,
        left: 10,
    },
    range: {
        start: new Date(new Date().getTime() - 3600000 * 24 * 365), // one year ago
        end: new Date(),
    },
    zoom: {
        onZoomStart: null,
        onZoom: null,
        onZoomEnd: null,
        minimumScale: 0,
        maximumScale: Infinity,
    },
});
