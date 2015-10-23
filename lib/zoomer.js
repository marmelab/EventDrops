import d3 from 'd3';

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

export default (svgElement, dimensions, scales, configuration, drawCallback) => {
    const zoom = d3.behavior.zoom()
        .scaleExtent([configuration.minScale, configuration.maxScale])
        .size([dimensions.width, dimensions.height])
        .x(scales.x)
        .on('zoom', drawCallback);

    const zoomArea = svgElement.append('rect')
        .classed('zoom', true)
        .attr({
            width: dimensions.width,
            height: dimensions.outer_height
        })
        .call(zoom);

    if (typeof configuration.eventHover === 'function') {
        zoomArea.on('mousemove', circleHandler(zoomArea, configuration.eventHover));
    }

    if (typeof configuration.eventClick === 'function') {
        zoomArea.on('click', circleHandler(zoomArea, configuration.eventClick));
    }
};
