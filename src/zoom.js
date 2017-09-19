export default (svg, config, xScale, draw) => {
    const zoom = d3.zoom();

    zoom.on('zoom', () => {
        const newScale = d3.event.transform.rescaleX(xScale);
        // @FIXME: remove d3.selectAll to use current selection
        d3.selectAll('svg').call(draw(config, newScale));
    });

    return zoom;
};
