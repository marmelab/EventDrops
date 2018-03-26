import dropLine from './dropLine';

const defaultConfig = {
    metaballs: true,
    label: {
        text: d => d.name,
        padding: 20,
        width: 200,
    },
    line: {
        color: 'black',
        height: 40,
    },
};

const defaultScale = d3.scaleTime();

jest.mock('./drop');

describe('Drop Line', () => {
    beforeEach(() => {
        document.body.appendChild(document.createElement('svg'));
    });

    describe('Container', () => {
        it('should add a .drop-line container for each row of data', () => {
            const selection = d3
                .select('svg')
                .data([[{ name: 'foo' }, { name: 'bar' }]]);

            dropLine(defaultConfig, defaultScale)(selection);
            expect(document.querySelectorAll('.drop-line').length).toBe(2);
        });

        it('should fill the line according to the line.color configuration', () => {
            const test = (color, expectedColor) => {
                d3.selectAll('.drop-line').remove();

                const selection = d3
                    .select('svg')
                    .data([
                        [
                            { name: 'foo', color: 'blue' },
                            { name: 'bar', color: 'yellow' },
                        ],
                    ]);

                const config = {
                    ...defaultConfig,
                    line: {
                        ...defaultConfig.line,
                        color,
                    },
                };

                dropLine(config, defaultScale)(selection);
                expect(
                    document.querySelector('.drop-line').getAttribute('fill')
                ).toBe(expectedColor);
            };

            test('yellow', 'yellow');
            test(d => d.color, 'blue');
        });

        it('should set the container at correct vertical position depending of its index', () => {
            const selection = d3
                .select('svg')
                .data([[{ name: 'foo' }, { name: 'bar' }]]);

            dropLine(defaultConfig, defaultScale)(selection);

            const positions = [...document.querySelectorAll('.drop-line')].map(
                e => e.getAttribute('transform')
            );
            expect(positions).toEqual(['translate(0, 0)', 'translate(0, 40)']);
        });

        it('should be removed when row of data is removed', () => {
            const selection = d3
                .select('svg')
                .data([[{ name: 'foo' }, { name: 'bar' }]]);

            dropLine(defaultConfig, defaultScale)(selection);
            expect(document.querySelectorAll('.drop-line').length).toBe(2);

            selection.data([[{ name: 'foo' }]]);
            dropLine(defaultConfig, defaultScale)(selection);

            expect(document.querySelectorAll('.drop-line').length).toBe(1);
        });
    });

    describe('Line Separator', () => {
        it('should add a line separator in each drop line container', () => {
            const selection = d3
                .select('svg')
                .data([[{ name: 'foo' }, { name: 'bar' }]]);

            dropLine(defaultConfig, defaultScale)(selection);
            expect(document.querySelectorAll('.line-separator').length).toBe(2);
        });

        it('should be full width, starting at right of the labels', () => {
            const selection = d3.select('svg').data([[{ name: 'foo' }]]);

            dropLine(defaultConfig, defaultScale)(selection);

            const lineSeparator = document.querySelector('.line-separator');
            expect(+lineSeparator.getAttribute('x1')).toBe(200);
            expect(lineSeparator.getAttribute('x2')).toBe('100%');
        });

        it('should be correctly vertically positionned', () => {
            const selection = d3.select('svg').data([[{ name: 'foo' }]]);

            dropLine(defaultConfig, defaultScale)(selection);

            const lineSeparator = document.querySelector('.line-separator');
            expect(+lineSeparator.getAttribute('y1')).toBe(40);
            expect(+lineSeparator.getAttribute('y2')).toBe(40);
        });
    });

    describe('Label', () => {
        it('should add correct text in drop line container', () => {
            const test = (label, expectedLabel) => {
                const selection = d3.select('svg').data([[{ name: 'foo' }]]);

                const config = {
                    ...defaultConfig,
                    label: {
                        ...defaultConfig.label,
                        text: label,
                    },
                };

                dropLine(config, defaultScale)(selection);
                expect(
                    document.querySelector('.drop-line text').textContent
                ).toBe(expectedLabel);
            };

            test('HARDWRITTEN LABEL', 'HARDWRITTEN LABEL');
            test(d => d.name, 'foo');
        });

        it('should set correct horizontal position, taking into account label padding', () => {
            const selection = d3.select('svg').data([[{ name: 'foo' }]]);

            dropLine(defaultConfig, defaultScale)(selection);
            // labels width - labels padding = 180
            expect(
                +document.querySelector('.drop-line text').getAttribute('x')
            ).toBe(180);
        });

        it('should be vertically centered', () => {
            const selection = d3.select('svg').data([[{ name: 'foo' }]]);

            dropLine(defaultConfig, defaultScale)(selection);
            expect(
                document.querySelector('.drop-line text').getAttribute('dy')
            ).toBe('0.25em');
        });

        it('should be right aligned', () => {
            const selection = d3.select('svg').data([[{ name: 'foo' }]]);

            dropLine(defaultConfig, defaultScale)(selection);
            expect(
                document
                    .querySelector('.drop-line text')
                    .getAttribute('text-anchor')
            ).toBe('end');
        });

        it('should be over drops (case of labels overlapping drops using negative padding)', () => {
            const selection = d3.select('svg').data([[{ name: 'foo' }]]);

            dropLine(defaultConfig, defaultScale)(selection);

            const lineChildren = document.querySelector('.drop-line').children;

            let textIndex = null;
            let dropsIndex = null;
            for (let childIndex in lineChildren) {
                const child = lineChildren[childIndex];
                if (child.classList.contains('drops')) {
                    dropsIndex = +childIndex;
                    continue;
                }

                if (child.tagName === 'TEXT') {
                    textIndex = +childIndex;
                    continue;
                }
            }

            expect(textIndex).not.toBe(-1);
            expect(dropsIndex).not.toBe(-1);
            expect(textIndex > dropsIndex).toBe(true);
        });
    });

    describe('Drops Container', () => {
        it('should add a drop container in each drop line container');
        it('should position it correctly, letting some space for labels');
        it('should draw drops in it');
    });

    describe('Metaballs', () => {
        it('should add metaballs filter on drop container if metaballs is on');
        it(
            'should add a transparent rect with correct dimensions to increase size of drops container if metaballs is on'
        );
        it('should add neither metaballs filter nor rect if metaballs is off');
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });
});
