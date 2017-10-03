import bounds from './bounds';

const defaultConfig = {
    margin: {
        top: 10,
        left: 20,
        bottom: 30,
        right: 40,
    },
    bound: {
        format: () => {},
    },
    label: {
        width: 200,
    },
    line: {
        height: 40,
    },
};

const defaultScale = d3.scaleTime();

describe('Bounds', () => {
    beforeEach(() => {
        document.body.appendChild(document.createElement('svg'));
    });

    it('should add a group classed ".bound.start"', () => {
        const selection = d3.select('svg').data([[{}, {}]]);

        bounds(defaultConfig, defaultScale)(selection);
        expect(document.querySelectorAll('g.bound.start').length).toBe(1);
    });

    it('should position start bound at bottom left, near the labels', () => {
        const selection = d3.select('svg').data([[{}, {}, {}]]);

        bounds(defaultConfig, defaultScale)(selection);

        const startBound = document.querySelector('g.bound.start');
        // translate(labelsWidth, three rows of data * lineHeight + margin.top)
        expect(startBound.getAttribute('transform')).toBe(
            'translate(200, 130)'
        );
    });

    it('should display correctly formatted scale domain start as a start bound', () => {
        const selection = d3.select('svg').data([[{}, {}, {}]]);

        const formatStub = jest.fn(() => 'Formatted Bound');

        const config = {
            ...defaultConfig,
            bound: { format: formatStub },
        };

        const scale = d3
            .scaleTime()
            .domain([new Date('2017-01-01'), new Date('2017-02-01')]);

        bounds(config, scale)(selection);

        const startBound = document.querySelector('g.bound.start');
        expect(startBound.textContent).toBe('Formatted Bound');
        expect(formatStub).toHaveBeenCalledWith(new Date('2017-01-01'));
    });

    it('should add a group classed ".bound.end"', () => {
        const selection = d3.select('svg').data([[{}, {}]]);

        bounds(defaultConfig, defaultScale)(selection);
        expect(document.querySelectorAll('g.bound.end').length).toBe(1);
    });

    it('should position start bound at bottom right', () => {
        const selection = d3.select('svg').data([[{}, {}, {}]]);

        bounds(defaultConfig, defaultScale)(selection);

        const endBound = document.querySelector('g.bound.end');
        // translate(labelsWidth, three rows of data * lineHeight + margin.top)
        expect(endBound.getAttribute('transform')).toBe('translate(200, 130)');
    });

    it('should display correctly formatted scale domain end as an end bound', () => {
        const selection = d3.select('svg').data([[{}, {}, {}]]);

        const formatStub = jest.fn(() => 'Formatted Bound');

        const config = {
            ...defaultConfig,
            bound: { format: formatStub },
        };

        const scale = d3
            .scaleTime()
            .domain([new Date('2017-01-01'), new Date('2017-02-01')]);

        bounds(config, scale)(selection);

        const endBound = document.querySelector('g.bound.end');
        expect(endBound.textContent).toBe('Formatted Bound');
        expect(formatStub).toHaveBeenCalledWith(new Date('2017-02-01'));
    });

    it('should right align end bound text', () => {
        const selection = d3.select('svg').data([[{}, {}, {}]]);

        const scale = d3.scaleTime().range([200, 800]);
        bounds(defaultConfig, scale)(selection);

        const endBound = document.querySelector('g.bound.end text');
        expect(endBound.getAttribute('text-anchor')).toBe('end');

        // rangeEnd - marginRight
        expect(+endBound.getAttribute('x')).toBe(760);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });
});
