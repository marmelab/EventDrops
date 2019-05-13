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

export function getDomainTransform(d3, config, zoom, domain, xScale, width) {
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
