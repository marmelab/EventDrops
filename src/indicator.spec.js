import indicator from './indicator';

const defaultConfig = {
    drop: {
        color: 'red',
        radius: 8,
        date: x => x,
    },
    label: {
        width: 200,
    },
    line: {
        height: 20,
    },
    indicator: {
        previousText: '◀',
        nextText: '▶',
    },
};

const now = Date.now();
const day = 3600 * 24;
const twoMonthsAgo = now - 60 * day;
const lastMonth = now - 30 * day;
const yesterday = now - 1 * day;
const tomorrow = now + 1 * day;

const defaultScale = d3
    .scaleTime()
    .domain([lastMonth, now])
    .range([0, 1000]);

describe('Indicator', () => {
    beforeEach(() => {
        document.body.appendChild(document.createElement('svg'));
    });

    it('should not add any indicators if data is within range', () => {
        const selection = d3.select('svg').data([
            {
                fullData: [yesterday],
            },
        ]);

        indicator(defaultConfig, defaultScale)(selection);

        expect(document.querySelectorAll('.indicator').length).toBe(0);
    });

    it('should add left arrow if there is data before range', () => {
        const selection = d3.select('svg').data([
            {
                fullData: [twoMonthsAgo],
            },
        ]);

        indicator(defaultConfig, defaultScale)(selection);

        const indicators = document.querySelectorAll('.indicator');

        expect(indicators.length).toBe(1);
        expect(indicators[0].textContent).toBe('◀');
    });

    it('should add right indicator if there is data after range', () => {
        const selection = d3.select('svg').data([
            {
                fullData: [tomorrow],
            },
        ]);

        indicator(defaultConfig, defaultScale)(selection);

        const indicators = document.querySelectorAll('.indicator');

        expect(indicators.length).toBe(1);
        expect(indicators[0].textContent).toBe('▶');
    });

    it('should add both left and right arrow if there is data before and after range', () => {
        const selection = d3.select('svg').data([
            {
                fullData: [twoMonthsAgo, tomorrow],
            },
        ]);

        indicator(defaultConfig, defaultScale)(selection);

        const indicators = document.querySelectorAll('.indicator');

        expect(indicators.length).toBe(2);
        expect(indicators[0].textContent).toBe('◀');
        expect(indicators[1].textContent).toBe('▶');
    });

    it("should use text configuration if it's set", () => {
        const selection = d3.select('svg').data([
            {
                fullData: [twoMonthsAgo, tomorrow],
            },
        ]);
        const config = {
            ...defaultConfig,
            indicator: {
                previousText: 'prev',
                nextText: 'next',
            },
        };

        indicator(config, defaultScale)(selection);

        const indicators = document.querySelectorAll('.indicator');

        expect(indicators.length).toBe(2);
        expect(indicators[0].textContent).toBe('prev');
        expect(indicators[1].textContent).toBe('next');
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });
});
