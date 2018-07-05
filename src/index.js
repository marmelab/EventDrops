import defaultsDeep from 'lodash.defaultsdeep';

import axis from './axis';
import bounds from './bounds';
import defaultConfiguration from './config';
import dropLine from './dropLine';
import zoom from './zoom';
import { addMetaballsDefs } from './metaballs';

import './style.css';
import { withinRange } from './withinRange';
import { selection } from 'd3/build/d3';

const getEvent = () => d3.event; // keep d3.event mutable see https://github.com/d3/d3/issues/2733

// do not export anything else here to keep window.eventDrops as a function
export default ({ d3 = window.d3, ...customConfiguration }) => {
    const config = defaultsDeep(
        customConfiguration || {},
        defaultConfiguration(d3)
    );

    const chart = selection => {
        const {
            drops,
            zoom: zoomConfig,
            drop: { onClick, onMouseOut, onMouseOver },
            metaballs,
            label: { width: labelWidth },
            line: { height: lineHeight },
            range: { start: rangeStart, end: rangeEnd },
            margin,
        } = config;

        // Follow margins conventions (https://bl.ocks.org/mbostock/3019563)
        const width = selection.node().clientWidth - margin.left - margin.right;

        const xScale = d3
            .scaleTime()
            .domain([rangeStart, rangeEnd])
            .range([0, width - labelWidth]);

        chart._scale = xScale;

        const svg = selection.selectAll('svg').data(selection.data());

        svg.exit().remove();

        svg
            .enter()
            .append('svg')
            .attr('width', width)
            .classed('event-drop-chart', true)
            .merge(svg)
            .attr(
                'height',
                d => (d.length + 1) * lineHeight + margin.top + margin.bottom
            )
            .call(dropLine(config, xScale));

        // @TODO: add back viewport

        // if (zoomConfig) {
        //     svg.call(zoom(d3, svg, config, xScale, draw, getEvent));
        // }

        // if (metaballs) {
        //     svg.call(addMetaballsDefs(config));
        // }
    };

    // chart.scale = () => chart._scale;
    // chart.filteredData = () => chart._filteredData;

    // const draw = (config, scale) => selection => {
    //     // console.log(selection.data());
    //     // const {
    //     //     drop: { date: dropDate },
    //     // } = config;
    //     // const dateBounds = scale.domain().map(d => new Date(d));
    //     // const filteredData = selection.data().map(dataSet => {
    //     //     if (!Array.isArray(dataSet)) {
    //     //         throw new Error(
    //     //             'Selection data is not an array. Are you sure you provided an array of arrays to `data` function?'
    //     //         );
    //     //     }
    //     //     return dataSet.map(row => {
    //     //         if (!row.fullData) {
    //     //             row.fullData = config.drops(row);
    //     //             if (!row.fullData) {
    //     //                 throw new Error(
    //     //                     'No drops data has been found. It looks by default in the `data` property. You can use the `drops` configuration parameter to tune it.'
    //     //                 );
    //     //             }
    //     //         }
    //     //         row.data = row.fullData.filter(d =>
    //     //             withinRange(dropDate(d), dateBounds)
    //     //         );
    //     //         return row;
    //     //     });
    //     // });
    //     // chart._scale = scale;
    //     // chart._filteredData = filteredData[0];
    //     // selection
    //     //     .data(filteredData)
    //     //     .call(dropLine(config, scale))
    //     //     .call(bounds(config, scale))
    //     //     .call(axis(d3, config, scale));
    // };

    // chart.draw = selection => draw(config, chart._scale)(selection);

    return chart;
};
