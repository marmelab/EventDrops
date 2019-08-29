export const getShiftedTransform = (
    originalTransform,
    labelsWidth,
    labelsPadding,
    d3
) => {
    const fullLabelWidth = labelsWidth + labelsPadding;

    const { x, y, k } = originalTransform;

    return d3.zoomIdentity
        .translate(-fullLabelWidth, 0) // move origin as if there were no labels
        .translate(x, y) // apply zoom transformation panning
        .scale(k) // apply zoom transformation scaling
        .translate(labelsWidth + labelsPadding, 0); // put origin at its original position
};

/**
 * Given a domain, return a zoomIdentity (transformation) which can be called to zoom to that domain.
 * Translates in reverse direction of the labels before applying the zoom and resets after,
 * which factors out the label when creating zoom.
 *
 * @param {Object} d3 d3 object
 * @param {Object} config configuration
 * @param {Object[]} domain `[date, date]` where first and second is first date and last to zoom to respectively
 * @param {Object} xScale a d3 scaleTime
 * @param {number} width Width of the chart
 * @returns {Object} transform object with x, y, and k (scale)
 *
 * @see https://github.com/d3/d3-zoom#zoomIdentity
 * @example
 *  const transform = getDomainTransform(d3, config, domain, xScale, 1000);
 *  //transform: { x: 1.234, y: 0.323, k: 2.34 }
 */
export function getDomainTransform(d3, config, domain, xScale, width) {
    const { label: { width: labelsWidth, padding: labelsPadding } } = config;

    const fullLabelWidth = labelsWidth + labelsPadding;
    // For the reason of two additional translate see getShiftedTransform for explanation
    return d3.zoomIdentity
        .translate(fullLabelWidth, 0)
        .scale((width - labelsWidth) / (xScale(domain[1]) - xScale(domain[0])))
        .translate(-xScale(domain[0]), 0)
        .translate(-fullLabelWidth, 0);
}

export default (
    d3,
    svg,
    config,
    zoom,
    xScale,
    draw,
    getEvent,
    width,
    height
) => {
    const {
        label: { width: labelsWidth, padding: labelsPadding },
        zoom: {
            onZoomStart,
            onZoom,
            onZoomEnd,
            minimumScale,
            maximumScale,
            restrictPan,
        },
    } = config;

    const extentConstraint = [
        [labelsWidth + labelsPadding, 0],
        [width, height],
    ];

    zoom.scaleExtent([minimumScale, maximumScale]);

    //Restricts the pan area to be the specified start/end dates or initial if not set
    if (restrictPan) {
        zoom.translateExtent(extentConstraint).extent(extentConstraint);
    }

    zoom.on('zoom.start', onZoomStart).on('zoom.end', onZoomEnd);

    zoom.on('zoom', args => {
        const transform = getShiftedTransform(
            getEvent().transform,
            labelsWidth,
            labelsPadding,
            d3
        );

        const newScale = transform.rescaleX(xScale);

        svg.call(draw(config, newScale));

        if (onZoom) {
            onZoom(args);
        }
    });

    return zoom;
};
