const configurable = require('./util/configurable');
const d3 = require('d3');

import defaultConfig from './config';
import configure from './configure';
import Drawer from './drawer';
import ZoomArea from './zoomArea';

function eventDrops(config = {}) {
    const finalConfiguration = configure(config, defaultConfig);

    function yScale(data) {
        const scale = d3.scale.ordinal();

        return scale
            .domain(data.map((d) => d.name))
            .range(data.map((d, i) => i * 40));
    }

    function xScale(width, timeBounds) {
        return d3.time.scale()
            .range([0, width])
            .domain(timeBounds);
    }

    function eventDropGraph(selection) {
        selection.each(function draw(data) {
            const height = data.length * 40;
            const dimensions = {
                width: finalConfiguration.width - finalConfiguration.margin.right - finalConfiguration.margin.left,
                height,
                outer_height: height + finalConfiguration.margin.top + finalConfiguration.margin.bottom,
            };

            const scales = {
                x: xScale(dimensions.width, [finalConfiguration.start, finalConfiguration.end]),
                y: yScale(data),
            };

            const drawer = new Drawer(d3.select(this), dimensions, scales, finalConfiguration);

            drawer.initSvg();
            drawer.draw(data);

            // const zoomArea = new ZoomArea(drawer.svg, dimensions, scales, finalConfiguration);
            // zoomArea.init(dimensions, finalConfiguration);
        });
    }

    configurable(eventDropGraph, finalConfiguration);

    return eventDropGraph;
}

d3.chart = d3.chart || {};
d3.chart.eventDrops = eventDrops;

module.exports = eventDrops;
