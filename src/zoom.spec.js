import { getShiftedTransform } from './zoom';

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

    /* These tests are skipped as I can't find any way to test D3 event at this point. */
    it('should update scale according to given D3 zoom event');
    it('should redraw chart using newly zoomed scale');

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });
});
