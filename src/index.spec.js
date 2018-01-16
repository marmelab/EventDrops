import EventDrops from './';
import zoom from './zoom';

jest.mock('./zoom');

const resetDom = () => {
    document.body.innerHTML = '';
    document.body.appendChild(document.createElement('div'));
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
                        { date: new Date('2009-01-01') },
                        { date: new Date('2010-01-01') },
                        { date: new Date('2011-01-01') },
                        { date: new Date('2012-01-01') },
                    ],
                },
            ],
        ]);

        root.call(chart);

        const { data } = chart.filteredData()[0];
        expect(data).toEqual([
            { date: new Date('2010-01-01') },
            { date: new Date('2011-01-01') },
        ]);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });
});
