export default {
    drop: {
        color: null,
        radius: 8,
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
};
