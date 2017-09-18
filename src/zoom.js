export default (svg, config, xScale, draw) => {
    const zoom = d3.zoom();

    zoom.on('zoom', () => {
        const newScale = d3.event.transform.rescaleX(xScale);
        svg.call(draw(config, newScale));
    });

    return zoom;
};
