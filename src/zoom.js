import debounce from 'debounce';
import labels from './drawer/labels';
import { boolOrReturnValue } from './drawer/xAxis';

export const onRequestAnimationFrameFactory = (
    container,
    configuration,
    callback,
    sumDataCount,
    scalingFunction,
    data
) =>
    () => {
        container
            .selectAll('.drop-line')
            .selectAll('.drop')
            .attr('cx', d => scalingFunction(configuration.date(d)));

        sumDataCount(data);
        callback(data);
    };

export default (
    container,
    dimensions,
    scales,
    configuration,
    callback = () => {}
) => {
    const onZoom = data => {
        const scalingFunction = d3.event.transform.rescaleX(scales.x);

        const sumDataCount = debounce(
            labels(
                container.select('.labels'),
                { x: scalingFunction },
                configuration
            ),
            100
        );

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

        global.requestAnimationFrame(
            onRequestAnimationFrameFactory(
                container,
                configuration,
                callback,
                sumDataCount,
                scalingFunction,
                data
            )
        );
    };

    const zoom = d3
        .zoom()
        .scaleExtent([configuration.minScale, configuration.maxScale])
        .on('zoom', onZoom)
        .on('end', configuration.zoomend);

    container.call(zoom);

    return zoom;
};
