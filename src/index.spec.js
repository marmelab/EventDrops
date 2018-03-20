import EventDrops, { withinRange } from './';
import zoom from './zoom';

jest.mock('./zoom');

const resetDom = () => {
    document.body.innerHTML = '';
    document.body.appendChild(document.createElement('div'));
};

const defaultConfig = {
    label: {},
    line: {},
    drop: {},
    bound: {},
    margin: {},
    axis: {},
    locale: {},
};

describe('EventDrops', () => {
    beforeEach(() => {
        resetDom();
    });

    it('should enable zoom if and only if zoomConfig is not falsy', () => {
        const test = (zoomConfig, shouldZoomBeCalled) => {
            resetDom();
            zoom.mockClear();

            const chart = EventDrops({
                zoom: zoomConfig,
            });

            const root = d3.select('div').data([[{ data: [] }]]);

            chart(root);
            expect(zoom.mock.calls.length > 0).toBe(shouldZoomBeCalled);
        };

        test({}, true);
        test(false, false);
    });

    it('should give access to current scale', () => {
        const chart = EventDrops({
            range: {
                start: new Date('2010-01-01'),
                end: new Date('2011-01-01'),
            },
        });

        const root = d3.select('div').data([[{ data: [] }]]);
        root.call(chart);

        expect(chart.scale().domain()).toEqual([
            new Date('2010-01-01'),
            new Date('2011-01-01'),
        ]);
    });

    describe('Data Filtering', () => {
        it('should give an access to currently filtered data', () => {
            const chart = EventDrops({
                range: {
                    start: new Date('2010-01-01'),
                    end: new Date('2011-01-01'),
                },
            });

            const root = d3.select('div').data([
                [
                    {
                        data: [
                            new Date('2009-01-01'),
                            new Date('2010-01-01'),
                            new Date('2011-01-01'),
                            new Date('2012-01-01'),
                        ],
                    },
                ],
            ]);

            root.call(chart);

            const { data } = chart.filteredData()[0];
            expect(data).toEqual([
                new Date('2010-01-01'),
                new Date('2011-01-01'),
            ]);
        });

        it('should filter data based on date retrieved using the `drop.date` configuration getter', () => {
            const chart = EventDrops({
                range: {
                    start: new Date('2010-01-01'),
                    end: new Date('2011-01-01'),
                },
                drop: {
                    date: d => d.createdAt,
                },
            });

            const root = d3.select('div').data([
                [
                    {
                        data: [
                            { createdAt: new Date('2009-01-01') },
                            { createdAt: new Date('2010-01-01') },
                            { createdAt: new Date('2011-01-01') },
                            { createdAt: new Date('2012-01-01') },
                        ],
                    },
                ],
            ]);

            root.call(chart);

            const { data } = chart.filteredData()[0];
            expect(data).toEqual([
                { createdAt: new Date('2010-01-01') },
                { createdAt: new Date('2011-01-01') },
            ]);
        });
    });

    it('should update exposed scale at each draw', () => {
        const chart = EventDrops(defaultConfig);
        const root = d3.select('div').data([
            [
                {
                    data: [
                        { date: new Date('2009-01-01') },
                        { date: new Date('2010-01-01') },
                        { date: new Date('2011-01-01') },
                        { date: new Date('2012-01-01') },
                    ],
                },
            ],
        ]);

        root.call(chart);

        const newScale = d3
            .scaleTime()
            .domain([new Date('2010-01-01'), new Date('2011-01-01')]);
        chart.draw(defaultConfig, newScale)(root);

        expect(chart.scale().domain()).toEqual([
            new Date('2010-01-01'),
            new Date('2011-01-01'),
        ]);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });
});

describe('withinRange', () => {
    it('should return true if date is in given date range', () => {
        const dateRange = [new Date('2018-04-01'), new Date('2018-05-01')];
        const test = (date, expectedResult) => {
            expect(withinRange(date, dateRange)).toBe(expectedResult);
        };

        test('2018-04-19', true);
        test('2018-04-01', true);
        test('2018-05-01', true);
        test('2018-05-19', false);
    });

    it('should return true if date is in given reverse date range (start date higher than end date', () => {
        const dateRange = [new Date('2018-05-01'), new Date('2018-04-01')];
        const test = (date, expectedResult) => {
            expect(withinRange(date, dateRange)).toBe(expectedResult);
        };

        test('2018-04-19', true);
        test('2018-04-01', true);
        test('2018-05-01', true);
        test('2018-05-19', false);
    });
});
