const METABALL_DEF_ID = 'metaballs';

export const addMetaballsDefs = config => selection => {
    const { metaballs: { blurDeviation, colorMatrix } } = config;

    const defs = selection.append('defs');
    const filter = defs.append('filter').attr('id', METABALL_DEF_ID);

    filter
        .append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('stdDeviation', blurDeviation)
        .attr('result', 'blur');

    filter
        .append('feColorMatrix')
        .attr('in', 'blur')
        .attr('mode', 'matrix')
        .attr('values', colorMatrix)
        .attr('result', 'contrast');

    filter
        .append('feBlend')
        .attr('in', 'SourceGraphic')
        .attr('in2', 'contrast');
};

export const addMetaballsStyle = selection =>
    selection.style('filter', `url(${METABALL_DEF_ID})`);
