import drop from './drop';

const defaultConfig = {
    drop: {
        color: 'red',
        radius: 8,
        date: x => x,
    },
};

const now = Date.now();
const lastYear = now - 3600 * 24 * 30;
const yesterday = now - 3600 * 24;
const tomorrow = now + 3600 * 24;

const defaultScale = d3.scaleTime().domain([lastYear, now]).range([0, 1000]);

describe('Drop', () => {
    beforeEach(() => {
        document.body.appendChild(document.createElement('svg'));
    });

    it('should pass `data` property as data to event', () => {
        const selection = d3.select('svg').data([
            {
                data: [{ id: 1 }],
            },
        ]);

        drop(defaultConfig, defaultScale)(selection);
        expect(d3.selectAll('circle').data()).toEqual([{ id: 1 }]);
    });

    it('should add classed a "drop" circle per piece of data', () => {
        const selection = d3.select('svg').data([
            {
                data: [yesterday, tomorrow],
            },
        ]);

        drop(defaultConfig, defaultScale)(selection);
        expect(document.querySelectorAll('circle.drop').length).toBe(2);
    });

    it('should set circle radius as defined in configuration', () => {
        const test = (radius, expectedRadius) => {
            d3.selectAll('.drop').remove();

            const selection = d3.select('svg').data([
                {
                    data: [{ id: 1 }],
                },
            ]);

            const config = {
                ...defaultConfig,
                drop: {
                    ...defaultConfig.drop,
                    radius,
                },
            };

            drop(config, defaultScale)(selection);
            expect(+document.querySelector('.drop').getAttribute('r')).toBe(
                expectedRadius
            );
        };

        test(5, 5);
        test(d => d.id * 2, 2);
    });

    it('should set drop color as defined in configuration', () => {
        const test = (color, expectedColor) => {
            d3.selectAll('.drop').remove();

            const selection = d3.select('svg').data([
                {
                    data: [{ color: 'blue' }],
                },
            ]);

            const config = {
                ...defaultConfig,
                drop: {
                    ...defaultConfig.drop,
                    color,
                },
            };

            drop(config, defaultScale)(selection);
            expect(document.querySelector('.drop').getAttribute('fill')).toBe(
                expectedColor
            );
        };

        test('yellow', 'yellow');
        test(d => d.color, 'blue');
    });

    it('should set x position according to current data date', () => {
        const selection = d3.select('svg').data([
            {
                data: [new Date('2017-01-15')],
            },
        ]);

        const scale = d3
            .scaleTime()
            .range([0, 100])
            .domain([new Date('2017-01-01'), new Date('2017-01-30')]);

        drop(defaultConfig, scale)(selection);
        expect(+document.querySelector('.drop').getAttribute('cx')).toBeCloseTo(
            48.2,
            0.1
        );
    });

    it('should remove obsolete drops', () => {
        const selection = d3.select('svg').data([
            {
                data: [now, yesterday],
            },
        ]);

        drop(defaultConfig, defaultScale)(selection);
        expect(document.querySelectorAll('.drop').length).toBe(2);

        selection.data([
            {
                data: [{}],
            },
        ]);

        drop(defaultConfig, defaultScale)(selection);
        expect(document.querySelectorAll('.drop').length).toBe(1);
    });

    it('should remove overlapping drops (same date)', () => {
        const selection = d3.select('svg').data([
            {
                data: [now, now],
            },
        ]);

        drop(defaultConfig, defaultScale)(selection);
        expect(document.querySelectorAll('.drop').length).toBe(1);
    });

    it('should apply drop date function from configuration to each data', () => {
        const selection = d3.select('svg').data([
            {
                data: [{ date: now }],
            },
        ]);

        drop(defaultConfig, defaultScale)(selection);
        expect(document.querySelectorAll('.drop').length).toBe(1);
    });

    it('should call `onMouseOver` configuration listener when hovering a drop', () => {
        const selection = d3.select('svg').data([
            {
                data: [{ date: now }],
            },
        ]);

        const config = {
            ...defaultConfig,
            drop: {
                ...defaultConfig.drop,
                onMouseOver: jest.fn(),
            },
        };

        drop(config, defaultScale)(selection);

        const dropElement = d3.select('.drop').node();
        const event = new MouseEvent('SVGEvents', {});
        event.initMouseEvent(
            'mouseover',
            true,
            true,
            global,
            0,
            10,
            10,
            10,
            10,
            false,
            false,
            false,
            false,
            null,
            dropElement
        );
        dropElement.dispatchEvent(event);

        expect(config.drop.onMouseOver).toHaveBeenCalled();
    });

    it('should call `onMouseOut` configuration listener when blurring a drop', () => {
        const selection = d3.select('svg').data([
            {
                data: [{ date: now }],
            },
        ]);

        const config = {
            ...defaultConfig,
            drop: {
                ...defaultConfig.drop,
                onMouseOut: jest.fn(),
            },
        };

        drop(config, defaultScale)(selection);

        const dropElement = d3.select('.drop').node();
        const event = new MouseEvent('SVGEvents', {});
        event.initMouseEvent(
            'mouseout',
            true,
            true,
            global,
            0,
            10,
            10,
            10,
            10,
            false,
            false,
            false,
            false,
            null,
            dropElement
        );
        dropElement.dispatchEvent(event);

        expect(config.drop.onMouseOut).toHaveBeenCalled();
    });

    it('should call `onClick` configuration listener when clicking on drop', () => {
        const selection = d3.select('svg').data([
            {
                data: [{ date: now }],
            },
        ]);

        const config = {
            ...defaultConfig,
            drop: {
                ...defaultConfig.drop,
                onClick: jest.fn(),
            },
        };

        drop(config, defaultScale)(selection);

        const dropElement = d3.select('.drop').node();
        dropElement.click();

        expect(config.drop.onClick).toHaveBeenCalled();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });
});
