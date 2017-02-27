import * as d3 from 'd3-webpack-loader!';

export default (container, dimensions, scales, configuration, data, callback) => {
    const zoom = d3.zoom()
        .scaleExtent([configuration.minScale, configuration.maxScale])
        .on('zoom', () => {
            console.log('zoom before requestAnimationFrame');
            requestAnimationFrame(() =>{
                console.log('zoom requestAnimationFrame');
                callback(data);
            })
        });

    zoom.on('end', configuration.zoomend);
    container.call(zoom);
    return zoom;
};
