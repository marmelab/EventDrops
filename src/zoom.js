import * as d3 from 'd3/build/d3';
import xAxis from './xAxis';
import labels from './drawer/labels';
import { boolOrReturnValue } from './drawer/xAxis';
import debounce from 'debounce';

export default (
    container,
    dimensions,
    scales,
    configuration,
    data,
    callback
) => {
    const onZoom = (data, index, element) => {
        const scalingFunction = d3.event.transform.rescaleX(scales.x);

        if (boolOrReturnValue(configuration.hasTopAxis, data)) {
            container
                .selectAll('.x-axis.top')
                .call(d3.axisTop().scale(scalingFunction));
        }

        if (boolOrReturnValue(configuration.hasBottomAxis, data)) {
            container
                .selectAll('.x-axis.bottom')
                .call(d3.axisBottom().scale(scalingFunction));
        }

        const sumDataCount = debounce(
            labels(
                container.select('.labels'),
                { x: scalingFunction },
                configuration
            ),
            100
        );

        requestAnimationFrame(() => {
            const drops = container
                .selectAll('.drop-line')
                .selectAll('.drop')
                .attr('cx', (d, i) => {
                    return scalingFunction(new Date(d.date));
                });

            sumDataCount(data);

            if (callback) {
                callback(data);
            }
        });
    };

    const zoom = d3
        .zoom()
        .scaleExtent([configuration.minScale, configuration.maxScale])
        .on('zoom', onZoom)
        .on('end', configuration.zoomend);

    container.call(zoom);
    return zoom;
};
