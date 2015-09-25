import d3 from 'd3';

import Zoomer from './zoomer';

class ZoomArea {
    constructor(svgElement, dimensions, scales, configuration) {
        this._svgElement = svgElement;
        this._zoomer = new Zoomer(scales.x, dimensions, {
            eventZoom: configuration.eventZoom,
            hasDelimiter: configuration.hasDelimiter,
        });
    }

    init(dimensions, configuration) {
        this._zoomArea = this._svgElement.append('rect')
            .call(this._zoomer.zoom)
            .classed('zoom', true)
            .attr('width', dimensions.width)
            .attr('height', dimensions.outer_height)
            .attr('transform', `translate(${configuration.margin.left}, 35)`);

        if (typeof configuration.eventHover === 'function') {
            this._zoomArea.on('mousemove', this._mouseMoveHandler(configuration.eventHover));
        }

        if (typeof configuration.eventClick === 'function') {
            this._zoomArea.on('click', this._clickHandler(configuration.eventClick));
        }
    }

    _mouseMoveHandler(eventHover) {
        return () => {
            const event = d3.event;
            const { clientX, clientY } = event;

            if (this._x === clientX && this._y === clientY) {
                return;
            }

            this._x = clientX;
            this._y = clientY;
            this._zoomArea.attr('display', 'none');

            const el = document.elementFromPoint(d3.event.clientX, d3.event.clientY);
            this._zoomArea.attr('display', 'block');
            if (el.tagName !== 'circle') {
                return;
            }

            eventHover(el);
        };
    }

    _clickHandler(eventClick) {
        return () => {
            this._zoomArea.attr('display', 'none');
            const el = document.elementFromPoint(d3.event.clientX, d3.event.clientY);
            this._zoomArea.attr('display', 'block');

            if (el.tagName !== 'circle') {
                return;
            }

            eventClick(el);
        };
    }
}

export default ZoomArea;
