import defaultsDeep from 'lodash.defaultsdeep';

import axis from './axis';
import bounds from './bounds';
import defaultConfiguration from './config';
import dropLine from './dropLine';
import zoom from './zoom';
import { addMetaballsDefs } from './metaballs';

import './style.css';
import { withinRange } from './withinRange';
import { ConfigInterface, anySelection, EventDropsInterface, timeScale } from './eventDrops';

const window:any = global;

// do not export anything else here to keep window.eventDrops as a function
export default ({ d3 = window.d3, ...customConfiguration }): EventDropsInterface => {
    const config: ConfigInterface = defaultsDeep(
        customConfiguration || {},
        defaultConfiguration(d3)
    );

    const {
        drops,
        zoom: zoomConfig,
        drop: { date: dropDate, onClick, onMouseOut, onMouseOver },
        metaballs,
        label: { width: labelWidth },
        line: { height: lineHeight },
        range: { start: rangeStart, end: rangeEnd },
        margin,
    } = config;

    const width = (selection: anySelection): number => {
        // Follow margins conventions (https://bl.ocks.org/mbostock/3019563)
        return selection.node().clientWidth - margin.left - margin.right;
    }

    const scale = (selection: anySelection): timeScale => {
        const chartWidth = width(selection);

        return d3
            .scaleTime()
            .domain([rangeStart, rangeEnd])
            .range([0, chartWidth - labelWidth]);
    };

    const visibleData = (selection: anySelection) => selection.data().map(dataSet => {
        if (!Array.isArray(dataSet)) {
            throw new Error(
                'Selection data is not an array. Are you sure you provided an array of arrays to `data` function?'
            );
        }

        const dateBounds = scale(selection).domain().map(d => new Date(d));

        return dataSet.map(row => {
            if (!row.fullData) {
                row.fullData = config.drops(row);
                if (!row.fullData) {
                    throw new Error(
                        'No drops data has been found. It looks by default in the `data` property. You can use the `drops` configuration parameter to tune it.'
                    );
                }
            }

            row.data = row.fullData.filter(d =>
                withinRange(dropDate(d), dateBounds)
            );

            return row;
        });
    });

    const drawChart = (selection: anySelection) => {
        selection
            .data(visibleData(selection))
            // .call(dropLine(config, scale))
            // .call(bounds(config, scale))
            // .call(axis(d3, config, scale));
    };

    const draw = (selection: anySelection): void => {
        const root = selection.selectAll('svg').data(selection.data());

        root.exit().remove();

        const svg = root
            .enter()
            .append('svg')
            .attr('width', width(selection))
            .classed('event-drop-chart', true);

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
            .call(drawChart);
    };

    return {
        draw,
        scale,
        visibleData,
        width,
    };

    //     const getEvent = () => d3.event; // keep d3.event mutable see https://github.com/d3/d3/issues/2733


    //     if (zoomConfig) {
    //         svg.call(zoom(d3, svg, config, xScale, draw, getEvent));
    //     }

    //     if (metaballs) {
    //         svg.call(addMetaballsDefs(config));
    //     }
};
