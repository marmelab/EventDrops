import { addMetaballsDefs, addMetaballsStyle } from './metaballs';

const defaultConfig = {
    metaballs: {
        blurDeviation: 10,
        colorMatrix: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 50 -10',
    },
};

describe('MetaBalls', () => {
    beforeEach(() => {
        document.body.appendChild(document.createElement('svg'));
    });

    describe('addMetaballsDefs', () => {
        it('should append correct gaussian blur filter definition', () => {
            const selection = d3.select('svg');
            addMetaballsDefs(defaultConfig)(selection);

            const gaussianBlur = document.querySelector('svg feGaussianBlur');
            expect(gaussianBlur.getAttribute('in')).toBe('SourceGraphic');
            expect(gaussianBlur.getAttribute('stdDeviation')).toBe('10');
            expect(gaussianBlur.getAttribute('result')).toBe('blur');
        });

        it('should append correct color matrix filter definition', () => {
            const selection = d3.select('svg');
            addMetaballsDefs(defaultConfig)(selection);

            const feColorMatrix = document.querySelector('svg feColorMatrix');
            expect(feColorMatrix.getAttribute('in')).toBe('blur');
            expect(feColorMatrix.getAttribute('mode')).toBe('matrix');
            expect(feColorMatrix.getAttribute('values')).toBe(
                '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 50 -10'
            );
            expect(feColorMatrix.getAttribute('result')).toBe('contrast');
        });

        it('should append correct blend filter definition', () => {
            const selection = d3.select('svg');
            addMetaballsDefs(defaultConfig)(selection);

            const blendFilter = document.querySelector('svg feblend');

            expect(blendFilter.getAttribute('in')).toBe('SourceGraphic');
            expect(blendFilter.getAttribute('in2')).toBe('contrast');
        });
    });

    describe('addMetaballsStyle', () => {
        it('should add correct filter style attribute', () => {
            const selection = d3.select('svg');
            addMetaballsStyle(selection);

            expect(selection.style('filter')).toBe('url(metaballs)');
        });
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });
});
