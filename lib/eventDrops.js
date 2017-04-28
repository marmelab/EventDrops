import * as d3 from 'd3/build/d3';

import configurable from 'configurable.js';
import defaultConfig from './config';
import drawer from './drawer';
import zoom from './zoom';

function eventDrops(config = {}) {
    const finalConfiguration = { ...defaultConfig, ...config };

    const yScale = data => {
        return d3
            .scaleOrdinal()
            .domain(data.map(d => d.name))
            .range(data.map((d, i) => i * finalConfiguration.lineHeight));
    };

    const xScale = (width, timeBounds) => {
        return d3.scaleTime().domain(timeBounds).range([0, width]);
    };

    function eventDropGraph(selection) {
        return selection.each(function selector(data) {
            d3.select(this).select('.event-drops-chart').remove();

            const dimensions = {
                width: this.clientWidth,
                height: data.length * finalConfiguration.lineHeight,
            };

            const svg = d3
                .select(this)
                .append('svg')
                .classed('event-drops-chart', true)
                .attr('width', dimensions.width)
                .attr(
                    'height',
                    dimensions.height +
                        finalConfiguration.margin.top +
                        finalConfiguration.margin.bottom
                );

            const scales = getScales(dimensions, finalConfiguration, data);

            const draw = drawer(svg, dimensions, scales, finalConfiguration);
            draw(data);

            if (finalConfiguration.zoomable) {
                zoom(svg, dimensions, scales, finalConfiguration, data);
            }
        });
    }

    function getScales(dimensions, configuration, data) {
        return {
            x: xScale(
                dimensions.width -
                    (configuration.labelsWidth +
                        configuration.labelsRightMargin),
                [configuration.start, configuration.end]
            ),
            y: yScale(data),
        };
    }

    configurable(eventDropGraph, finalConfiguration);

    return eventDropGraph;
}

d3.chart = d3.chart || {};
d3.chart.eventDrops = eventDrops;

export default eventDrops;
