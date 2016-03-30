import labels from '../../../lib/drawer/labels';

describe('Labels drawer', () => {
    const scales = {
        x: d3.time.scale(),
        y: d3.scale.ordinal(),
    };

    const config = {
        labelsWidth: 50,
    };

    const domain = [new Date('2014-01-01'), new Date('2014-05-01')];
    const data = [{ name: 'foo', dates: domain }];

    let svg;
    let container;

    beforeEach(() => {
        svg = d3.select('body').append('svg');
        svg.append('g').classed('extremum', true);

        container = svg
            .append('g')
            .classed('labels', true)
            .attr('transform', 'translate(0, 45)');
    });

    it('should apply labelsWidth config', () => {
        scales.x.domain(domain);
        labels(container, scales, config)(data);
        expect(svg.select('.label').attr('x')).toBe(config.labelsWidth.toString(10));
    });
});
