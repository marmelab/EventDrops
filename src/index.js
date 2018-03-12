import defaultsDeep from 'lodash.defaultsdeep';

import axis from './axis';
import bounds from './bounds';
import defaultConfiguration from './config';
import dropLine from './dropLine';
import zoom from './zoom';
import { addMetaballsDefs } from './metaballs';

import './style.css';

const withinRange = (date, dateBounds) =>
    // @TODO: remove the `new Date()` constructor in the next major version: we need to force it at configuration level.
    new Date(date) >= dateBounds[0] && new Date(date) <= dateBounds[1];

export default ({ d3 = window.d3, ...customConfiguration }) => {
    const chart = selection => {
        const config = defaultsDeep(
            customConfiguration || {},
            defaultConfiguration(d3)
        );

        const {
            zoom: zoomConfig,
            drop: { onClick, onMouseOut, onMouseOver },
            metaballs,
            label: { width: labelWidth },
            line: { height: lineHeight },
            range: { start: rangeStart, end: rangeEnd },
            margin,
        } = config;

        const getEvent = () => d3.event; // keep d3.event mutable see https://github.com/d3/d3/issues/2733

        // Follow margins conventions (https://bl.ocks.org/mbostock/3019563)
        const width = selection.node().clientWidth - margin.left - margin.right;

        const xScale = d3
            .scaleTime()
            .domain([rangeStart, rangeEnd])
            .range([0, width - labelWidth]);

        chart._scale = xScale;

        const root = selection.selectAll('svg').data(selection.data());

        root.exit().remove();

        const svg = root
            .enter()
            .append('svg')
            .attr('width', width)
            .classed('event-drop-chart', true);

        if (zoomConfig) {
            svg.call(zoom(d3, svg, config, xScale, draw, getEvent));
        }

        if (metaballs) {
            svg.call(addMetaballsDefs(config));
        }

        svg
            .merge(root)
            .attr(
                'height',
                d => (d.length + 1) * lineHeight + margin.top + margin.bottom
            );

        svg
            .append('g')
            .classed('viewport', true)
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .call(draw(config, xScale));
    };

    chart.scale = () => chart._scale;
    chart.filteredData = () => chart._filteredData;

    const draw = (config, scale) => selection => {
        const { drop: { date: dropDate } } = config;

        const dateBounds = scale.domain().map(d => new Date(d));
        const filteredData = selection.data().map(dataSet =>
            dataSet.map(row => {
                if (!row.fullData) {
                    row.fullData = row.data;
                }

                row.data = row.fullData.filter(d =>
                    withinRange(dropDate(d), dateBounds)
                );

                return row;
            })
        );

        chart._scale = scale;
        chart._filteredData = filteredData[0];

        selection
            .data(filteredData)
            .call(dropLine(config, scale))
            .call(bounds(config, scale))
            .call(axis(d3, config, scale));
    };

    chart.draw = draw;

    return chart;
};
