import eventDrops from '../../../lib/eventDrops';
import * as index from '../../../lib/drawer/index';

describe('Main drawer', () => {

    let dimensions;
    let svg;
    let scales;

    beforeEach(() => {
        dimensions = {
            height: 100,
            width: 200
        };
        scales = {
            x: d3.scaleTime(),
            y: d3.scaleOrdinal()
        };
        svg = d3.select('body').append('svg');
    });

    describe('Metaballs behavior', () => {

        const invokeWithMetaballs = (value) => {
            const configuration = {
                margin: {
                    top: 60,
                    left: 200,
                    bottom: 40,
                    right: 50,
                },
                metaballs: value
            };
            index.default(svg, dimensions, scales, configuration);
        };
        let metaballs;

        beforeEach(() => {
            metaballs = require('../../../lib/metaballs');
            spyOn(metaballs, 'metaballs').and.callThrough();
        });

        it('should use metaballs filter when configured', () => {
            invokeWithMetaballs(true);
            expect(metaballs.metaballs).toHaveBeenCalled();
            expect(metaballs.metaballs).toHaveBeenCalledWith(svg.select('defs'));
            expect(svg.select('.drops-container').style('filter')).toEqual('url("#metaballs")');
        });

        it('should not use metaballs filter when not configured', () => {
            invokeWithMetaballs(false);
            expect(metaballs.metaballs.calls.any()).toBe(false);
            expect(svg.select('.drops-container').style('filter')).toEqual('none');
        });

    });

});
