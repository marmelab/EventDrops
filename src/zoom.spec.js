import zoomFactory, { getShiftedTransform, getDomainTransform } from './zoom';

const defaultConfig = {
    label: {},
    zoom: {},
};

describe('Zoom', () => {
    beforeEach(() => {
        document.body.appendChild(document.createElement('svg'));
    });

    it('should correct shifted transform given original transform', () => {
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

    it('should transform correctly given domain', () => {
        const config = {
            ...defaultConfig,
            zoom: {
                minimumScale: 15,
                maximumScale: 25,
            },
            label: { width: 100, padding: 50 },
        };

        const rangeStartEnd = [new Date(2016, 0, 1), new Date(2019, 0, 1)];
        const xScale = d3
            .scaleTime()
            .domain(rangeStartEnd)
            .range([0, 100]);

        const width = 400;
        const zoomObject = d3.zoom();
        const domain = [new Date(2017, 0, 1), new Date(2018, 0, 1)];
        const zoomIdentity = getDomainTransform(
            d3,
            config,
            zoomObject,
            domain,
            xScale,
            width
        );

        expect(zoomIdentity).toEqual({
            k: 9.008219178082191,
            x: -1502.054794520548,
            y: 0,
        });
    });

    it('should set scale extent based on given configuration', () => {
        const config = {
            ...defaultConfig,
            zoom: {
                minimumScale: 15,
                maximumScale: 25,
            },
        };

        const zoomObject = d3.zoom();
        const selection = d3.select('svg');
        const zoom = zoomFactory(d3, selection, config, zoomObject);
        expect(zoom.scaleExtent()).toEqual([15, 25]);
    });

    it('should set translate extent if restrictPan is true', () => {
        const test = (config, translateExtent) => {
            const width = 500,
                height = 300;

            const selection = d3.select('svg');
            const zoomRestrict = zoomFactory(
                d3,
                selection,
                config,
                d3.zoom(),
                {},
                {},
                {},
                width,
                height
            );

            expect(zoomRestrict.translateExtent()).toEqual(translateExtent);
        };

        const config = {
            ...defaultConfig,
            label: {
                width: 100,
                padding: 20,
            },
        };

        test(config, [[-Infinity, -Infinity], [Infinity, Infinity]]);

        config.zoom.restrictpan = true;
        test(config, [[120, 0], [500, 300]]);
    });

    /* These tests are skipped as I can't find any way to test D3 event at this point. */
    it('should update scale according to given D3 zoom event');
    it('should redraw chart using newly zoomed scale');

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });
});
