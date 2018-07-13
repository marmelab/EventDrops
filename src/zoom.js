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

export default (chart, selection, d3, config, callback, getEvent) => {
    const {
        label: { width: labelsWidth, padding: labelsPadding },
        zoom: { onZoomStart, onZoom, onZoomEnd, minimumScale, maximumScale },
    } = config;

    const zoom = d3.zoom().scaleExtent([minimumScale, maximumScale]);

    zoom.on('zoom.start', onZoomStart).on('zoom.end', onZoomEnd);

    zoom.on('zoom', function(data) {
        const transform = getShiftedTransform(
            getEvent().transform,
            labelsWidth,
            labelsPadding,
            d3
        );

        chart.scale = transform.rescaleX(chart.scale);
        d3.select(this).call(callback(selection));

        if (onZoom) {
            onZoom(data);
        }
    });

    return zoom;
};
