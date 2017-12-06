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
                config: {
                    zoom: zoomConfig,
                },
            });

            const root = d3.select('div').data([[{ data: [] }]]);

            chart(root);
            expect(zoom.mock.calls.length > 0).toBe(shouldZoomBeCalled);
        };

        test({}, true);
        test(false, false);
    });

    it('should give access to current scale');
    it('should give an access to currently filtered data');

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });
});
