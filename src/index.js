import defaultConfiguration from './config';
import dropLine from './dropLine';
import zoom from './zoom';

import './style.css';

export const withinRange = (date, dateBounds) =>
    new Date(date) >= dateBounds[0] && new Date(date) <= dateBounds[1];

export const draw = (config, xScale) =>
    selection => {
        const dateBounds = xScale.domain().map(d => new Date(d));
        const filteredData = selection.data().map(dataSet =>
            dataSet.map(row => ({
                ...row,
                data: row.data.filter(d => withinRange(d.date, dateBounds)),
            })));

        selection.data(filteredData).call(dropLine(config, xScale));
    };

export default (config = defaultConfiguration) =>
    selection => {
        const {
            label: {
                width: labelWidth,
            },
            line: {
                height: lineHeight,
            },
            range: {
                start: rangeStart,
                end: rangeEnd,
            },
            margin,
        } = config;

        // Follow margins conventions (https://bl.ocks.org/mbostock/3019563)
        const width = selection.node().clientWidth - margin.left - margin.right;

        const xScale = d3
            .scaleTime()
            .domain([rangeStart, rangeEnd])
            .range([0, width - labelWidth]);

        const svg = selection.selectAll('svg').data(selection.data());

        svg
            .enter()
            .append('svg')
            .attr('width', width)
            .attr(
                'height',
                d => (d.length + 1) * lineHeight - margin.top - margin.bottom
            )
            .classed('event-drop-chart', true)
            .call(zoom(svg, config, xScale, draw))
            .merge(svg)
            .attr(
                'height',
                d => (d.length + 1) * lineHeight - margin.top - margin.bottom
            )
            .call(draw(config, xScale));

        svg.exit().remove();
    };
