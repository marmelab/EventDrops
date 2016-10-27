import d3 from 'd3';

export default (container, dimensions, scales, configuration, data, callback) => {
    const zoom = d3.behavior.zoom()
        .size([dimensions.width, dimensions.height])
        .scaleExtent([configuration.minScale, configuration.maxScale])
        .x(scales.x)
        .on('zoom', () => {
            requestAnimationFrame(() => callback(data));
        });

    zoom.on('zoomend', configuration.zoomend);
    container.call(zoom);
    return zoom;
};
