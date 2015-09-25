import d3 from 'd3';

class Zoomer {
    constructor(xScale, dimensions, config = {}) {
        this.eventZoom = config.eventZoom || () => {};
        this.hasDelimiter = config.hasDelimiter || false;
        this.xScale = xScale;

        this._zoom = d3.behavior.zoom()
            .center(null)
            .scaleExtent([config.minScale, config.maxScale])
            .size([dimensions.width, dimensions.height])
            .x(this.xScale)
            .on('zoom', this.onZoomHandler)
            .on('zoomend', this.onZoomEndHandler);
    }

    onZoomHandler() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.toString() === '[object MouseEvent]') {
            this.zoom.translate([d3.event.translate[0], 0]);
        }

        if (d3.event.sourceEvent && d3.event.sourceEvent.toString() === '[object WheelEvent]') {
            this.zoom.scale(d3.event.scale);
        }

        // redraw();
    }

    onZoomEndHandler() {
        if (this.eventZoom) {
            // this.eventZoom(xScale);
        }

        if (this.hasDelimiter) {
            // redrawDelimiter(xScale);
        }
    }

    get zoom() { return this._zoom; }
}

export default Zoomer;
