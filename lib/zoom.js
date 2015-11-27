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
    const zoom = d3.behavior.zoom()
        .scaleExtent([configuration.minScale, configuration.maxScale])
        .size([dimensions.width, dimensions.height])
        .x(scales.x)
        .on('zoom', () => {
            if (d3.event.sourceEvent && d3.event.sourceEvent.toString() === '[object MouseEvent]') {
                zoom.translate([d3.event.translate[0], 0]);
            }

            if (d3.event.sourceEvent && d3.event.sourceEvent.toString() === '[object WheelEvent]') {
                zoom.scale(d3.event.scale);
            }

            callback(data);
        });

    container.call(zoom);

    if (typeof configuration.eventHover === 'function') {
        zoomArea.on('mousemove', circleHandler(zoomArea, configuration.eventHover));
    }

    if (typeof configuration.eventClick === 'function') {
        zoomArea.on('click', circleHandler(zoomArea, configuration.eventClick));
    }
};
