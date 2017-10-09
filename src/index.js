import defaultsDeep from 'lodash.defaultsdeep';

import axis from './axis';
import bounds from './bounds';
import defaultConfiguration from './config';
import dropLine from './dropLine';
import zoom from './zoom';
import { addMetaballsDefs } from './metaballs';

import './style.css';

export const withinRange = (date, dateBounds) =>
    new Date(date) >= dateBounds[0] && new Date(date) <= dateBounds[1];

export const draw = (config, xScale) =>
    selection => {
        const dateBounds = xScale.domain().map(d => new Date(d));
        const filteredData = selection.data().map(dataSet =>
            dataSet.map(({ name, data, fullData = data }) => ({
                name,
                fullData,
                data: fullData.filter(d => withinRange(d.date, dateBounds)),
            })));

        selection
            .data(filteredData)
            .call(dropLine(config, xScale))
            .call(bounds(config, xScale))
            .call(axis(config, xScale));
    };

export default (customConfiguration = {}) =>
    selection => {
        const config = defaultsDeep(customConfiguration, defaultConfiguration);

        const {
            metaballs,
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

        const root = selection.selectAll('svg').data(selection.data());

        root.exit().remove();

        const svg = root
            .enter()
            .append('svg')
            .attr('width', width)
            .classed('event-drop-chart', true)
            .call(zoom(root, config, xScale, draw));

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
