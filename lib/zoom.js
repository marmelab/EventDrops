import d3 from 'd3';

export default (container, dimensions, scales, configuration, data, callback) => {
    const zoom = d3.behavior.zoom()
        .size([dimensions.width, dimensions.height])
        .scaleExtent([configuration.minScale, configuration.maxScale])
        .x(scales.x)
        .on('zoom', () => {
            requestAnimationFrame(() => callback(data));
        });

    if (configuration.eventZoom) {
        zoom.on('zoomend', configuration.eventZoom);
    }

    return container.call(zoom);
};
