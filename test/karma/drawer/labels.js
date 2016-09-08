import labels from '../../../lib/drawer/labels';

describe('Labels drawer', () => {
    const scales = {
        x: d3.time.scale(),
        y: d3.scale.ordinal(),
    };

    const config = {
        labelsWidth: 50,
        date: d => d // From defaults
    };

    const domain = [new Date('2014-01-01'), new Date('2014-05-01')];
    const data = [{ name: 'foo', dates: domain }];

    let svg;
    let container;

    beforeEach(() => {
        d3.select('body').html('');
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
        expect(+svg.select('.label').attr('x')).toBe(50);
    });

    it('should show label count with simple data', () => {
        const data = [{name: 'foo', data: [new Date('2014-02-01'), new Date('2014-03-01')]}];
        scales.x.domain(domain);
        labels(container, scales, config)(data);
        expect(document.querySelector('.label').textContent).toBe('foo (2)');
    });

    it('should show label count with complex data', () => {
        const config =  {
            date: d => d.date
        };
        const complexData = [{ name: 'foo', data: [{ test: 'bar', date: new Date('2014-02-01') }, { test: 'baz', date: new Date('2014-03-01') }]}];

        scales.x.domain(domain);
        labels(container, scales, config)(complexData);

        expect(document.querySelector('.label').textContent).toBe('foo (2)');
    });
});
