export default {
    drop: {
        color: null,
        radius: 8,
    },
    label: {
        width: 200,
        padding: 20,
    },
    line: {
        color: (_, index) => d3.schemeCategory10[index],
        height: 50,
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
};
