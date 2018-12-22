import defaultLocale from 'd3-time-format/locale/en-US.json';

import axis, { tickFormat } from './axis';

const defaultConfig = {
    label: {
        width: 200,
    },
    locale: defaultLocale,
    axis: {
        formats: {
            milliseconds: '.%L',
            seconds: ':%S',
            minutes: '%I:%M',
            hours: '%I %p',
            days: '%a %d',
            weeks: '%b %d',
            months: '%B',
            year: '%Y',
        },
        verticalGrid: false,
        tickPadding: 6,
    },
    numberDisplayedTicks: {
        extra: 12,
    },
    line: {
        height: 40,
    },
};

const defaultScale = d3.scaleTime();
const defaultBreakpointLabel = 'extra';

describe('Axis Tick Format', () => {
    it('should format date correctly depending of current granularity', () => {
        const formats = defaultConfig.axis.formats;
        const test = (date, expectedOutput) => {
            expect(tickFormat(new Date(date), formats, d3)).toBe(
                expectedOutput
            );
        };

        test(new Date('2017-05-04 11:20:38.217'), '.217');
        test(new Date('2017-05-04 11:20:38.000'), ':38');
        test(new Date('2017-05-04 11:20:00.000'), '11:20');
        test(new Date('2017-05-04 11:00:00.000'), '11 AM');
        test(new Date('2017-05-04 00:00:00.000'), 'Thu 04');
        test(new Date('2017-05-01 00:00:00.000'), 'May');
        test(new Date('2017-01-01 00:00:00.000'), '2017');
    });
});

describe('Axis', () => {
    beforeEach(() => {
        document.body.appendChild(document.createElement('svg'));
    });

    it('should add a group with class "axis"', () => {
        const selection = d3.select('svg').data([[{}]]);

        axis(d3, defaultConfig, defaultScale, defaultBreakpointLabel)(
            selection
        );
        expect(document.querySelector('.axis')).toBeTruthy();
    });

    it('should append only a single group regardless number of given data', () => {
        const selection = d3.select('svg').data([[{}, {}, {}]]);

        axis(d3, defaultConfig, defaultScale, defaultBreakpointLabel)(
            selection
        );
        expect(document.querySelectorAll('.axis').length).toBe(1);
    });

    it('should be translated of `label.width` to the right', () => {
        const selection = d3.select('svg').data([[{}, {}, {}]]);

        axis(d3, defaultConfig, defaultScale, defaultBreakpointLabel)(
            selection
        );
        expect(document.querySelector('.axis').getAttribute('transform')).toBe(
            'translate(200,0)'
        );
    });

    it('should draw a D3 top axis using given scale', () => {
        const selection = d3.select('svg').data([[{}, {}]]);

        const axisTopSpy = jest.spyOn(d3, 'axisTop');
        axis(d3, defaultConfig, defaultScale, defaultBreakpointLabel)(
            selection
        );
        expect(axisTopSpy).toHaveBeenCalledWith(defaultScale);
    });

    it('should use tick formats passed in configuration', () => {
        const tickPaddingSpy = jest.fn(() => () => {});
        const ticksSpy = jest.fn(() => ({
            tickPadding: tickPaddingSpy,
        }));
        const tickFormatSpy = jest.fn(() => ({
            ticks: ticksSpy,
        }));
        jest.spyOn(d3, 'axisTop').mockImplementation(() => ({
            tickFormat: tickFormatSpy,
        }));

        const data = [[{ id: 'foo' }]];
        const selection = d3.select('svg').data(data);
        axis(d3, defaultConfig, defaultScale, defaultBreakpointLabel)(
            selection
        );

        const tickFormat = tickFormatSpy.mock.calls[0][0];
        expect(tickFormat(new Date('2017-01-01 12:00:00'))).toBe('12 PM');
    });

    it('should remove "axis" group when data is removed', () => {
        const data = [[{ id: 'foo' }]];
        const selection = d3.select('svg').data(data);
        axis(d3, defaultConfig, defaultScale, defaultBreakpointLabel)(
            selection
        );

        selection.data([[]]);
        axis(d3, defaultConfig, defaultScale, defaultBreakpointLabel)(
            selection
        );
        expect(document.querySelectorAll('.axis').length).toBe(0);
    });

    it('should display axis using configuration locale', () => {
        const timeFormatDefaultLocaleSpy = jest.spyOn(
            d3,
            'timeFormatDefaultLocale'
        );

        const config = {
            ...defaultConfig,
            locale: defaultLocale,
        };

        const data = [[{ id: 'foo' }]];
        const selection = d3.select('svg').data(data);
        axis(d3, config, defaultScale, defaultBreakpointLabel)(selection);

        expect(timeFormatDefaultLocaleSpy).toHaveBeenCalledWith(defaultLocale);
    });

    it('should display number of ticks passed in configuration', () => {
        const data = [[{ id: 'foo' }]];
        const selection = d3.select('svg').data(data);

        const config = {
            ...defaultConfig,
            numberDisplayedTicks: { extra: 9 },
        };

        axis(d3, config, defaultScale, defaultBreakpointLabel)(selection);
        expect(document.querySelectorAll('.tick').length).toBe(9);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });
});
