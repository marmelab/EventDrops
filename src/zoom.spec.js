import { onZoom } from './zoom';

describe('Zoom', () => {
    beforeEach(() => {
        document.body.appendChild(document.createElement('svg'));
    });

    /* These tests are skipped as I can't find any way to test D3 event at this point. */
    it('should update scale according to given D3 zoom event');
    it('should redraw chart using newly zoomed scale');

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });
});
