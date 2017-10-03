import axis from './axis';

const defaultConfig = {
    label: {
        width: 200,
    },
};

const defaultScale = d3.scaleTime();

describe('Axis', () => {
    beforeEach(() => {
        document.body.appendChild(document.createElement('svg'));
    });

    it('should add a group with class "axis"', () => {
        const selection = d3.select('svg').data([[{}]]);

        axis(defaultConfig, defaultScale)(selection);
        expect(document.querySelector('.axis')).toBeTruthy();
    });

    it('should append only a single group regardless number of given data', () => {
        const selection = d3.select('svg').data([[{}, {}, {}]]);

        axis(defaultConfig, defaultScale)(selection);
        expect(document.querySelectorAll('.axis').length).toBe(1);
    });

    it('should be translated of `label.width` to the right', () => {
        const selection = d3.select('svg').data([[{}, {}, {}]]);

        axis(defaultConfig, defaultScale)(selection);
        expect(document.querySelector('.axis').getAttribute('transform')).toBe(
            'translate(200,0)'
        );
    });

    it('should draw a D3 top axis using given scale', () => {
        const selection = d3.select('svg').data([[{}, {}]]);

        const axisTopSpy = jest.spyOn(d3, 'axisTop');
        axis(defaultConfig, defaultScale)(selection);
        expect(axisTopSpy).toHaveBeenCalledWith(defaultScale);
    });

    it('should remove "axis" group when data is removed', () => {
        const data = [[{ id: 'foo' }]];
        const selection = d3.select('svg').data(data);
        axis(defaultConfig, defaultScale)(selection);

        selection.data([[]]);
        axis(defaultConfig, defaultScale)(selection);
        expect(document.querySelectorAll('.axis').length).toBe(0);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });
});
