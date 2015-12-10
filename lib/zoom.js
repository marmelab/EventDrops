import d3 from 'd3';
import draw from './drawer';
import filterData from './filterData';

function getClosestCircle (zoomArea, x, y) {
    zoomArea.attr('display', 'none');
    const el = document.elementFromPoint(d3.event.clientX, d3.event.clientY);
    zoomArea.attr('display', 'block');
    if (el.tagName !== 'circle') {
        return;
    }

    return el;
}

function circleHandler(zoomArea, handler) {
    var circle = getClosestCircle(zoomArea, d3.event.clientX, d3.event.clientY);
    if (!circle) {
        return;
    }

    handler(circle);
}

export default (container, dimensions, scales, configuration, data, callback) => {
    // we need an intermediary element to prevent shaky behavior
    const zoomArea = container.append('rect')
        .classed('zoom-area', true)
        .attr('width', dimensions.width)
        .attr('height', dimensions.outer_height)
        .attr('transform', `translate(${configuration.margin.left},35)`);

    const zoom = d3.behavior.zoom()
        .size([dimensions.width, dimensions.height])
        .scaleExtent([configuration.minScale, configuration.maxScale])
        .x(scales.x)
        .on('zoom', () => {
            requestAnimationFrame(() => callback(data));
        });

    return zoomArea.call(zoom);
};
