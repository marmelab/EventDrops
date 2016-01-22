export const metaballs = defs => {
    const filters = defs.append('filter');

    filters.attr('id', 'metaballs');

    filters.append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('stdDeviation', 10)
        .attr('result', 'blur');

    filters.append('feColorMatrix')
        .attr('in', 'blur')
        .attr('mode', 'matrix')
        .attr('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 50 -10')
        .attr('result', 'contrast');

    filters.append('feBlend')
        .attr('in', 'SourceGraphic')
        .attr('in2', 'contrast');

    return filters;
}
