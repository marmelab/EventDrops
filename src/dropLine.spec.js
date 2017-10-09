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

describe('Drop Line', () => {
    beforeEach(() => {
        document.body.appendChild(document.createElement('svg'));
    });

    describe('Container', () => {
        it('should add a .drop-line container for each row of data');
        it('should fill the line according to the line.color configuration');
        it('should set the container at correct vertical position');
        it('should be removed when row of data is removed');
    });

    describe('Line Separator', () => {
        it('should add a line separator in each drop line container');
        it('should be full width, starting at right of the labels');
        it('should be correctly vertically positionned');
        it('should be removed when row of data is removed');
    });

    describe('Label', () => {
        it('should add a text in drop line container');
        it(
            'should set correct horizontal position, taking into account label padding'
        );
        it('should be vertically centered');
        it('should be right aligned');
        it(
            'should contain text defined by `label.text` configuration parameter'
        );
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
        jest.restoreAllMocks();
    });
});
