import zoomFactory, { getShiftedTransform } from './zoom';

const defaultConfig = {
    label: {},
    zoom: {},
};

describe('Zoom', () => {
    beforeEach(() => {
        document.body.appendChild(document.createElement('svg'));
    });

    describe('getShiftedTransform', () => {
        const originalTransform = {
            x: -120,
            y: 0,
            k: 1.23,
        };

        const shiftedTransform = getShiftedTransform(
            originalTransform,
            200,
            20,
            d3
        );
        expect(shiftedTransform.toString()).toBe(
            'translate(-69.39999999999998,0) scale(1.23)'
        );
    });

    it('should set scale extent based on given configuration', () => {
        const config = {
            ...defaultConfig,
            zoom: {
                minimumScale: 15,
                maximumScale: 25,
            },
        };

        const selection = d3.select('svg');
        const zoom = zoomFactory(d3, selection, config);
        expect(zoom.scaleExtent()).toEqual([15, 25]);
    });

    /* These tests are skipped as I can't find any way to test D3 event at this point. */
    it('should update scale according to given D3 zoom event');
    it('should redraw chart using newly zoomed scale');

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });
});
