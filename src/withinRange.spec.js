import { withinRange } from './withinRange';

describe('withinRange', () => {
    it('should return true if date is in given date range', () => {
        const dateRange = [new Date('2018-04-01'), new Date('2018-05-01')];
        const test = (date, expectedResult) => {
            expect(withinRange(date, dateRange)).toBe(expectedResult);
        };

        test(new Date('2018-04-19'), true);
        test(new Date('2018-04-01'), true);
        test(new Date('2018-05-01'), true);
        test(new Date('2018-05-19'), false);
    });

    it('should return true if date is in given reverse date range (start date older than end date)', () => {
        const dateRange = [new Date('2018-05-01'), new Date('2018-04-01')];
        const test = (date, expectedResult) => {
            expect(withinRange(date, dateRange)).toBe(expectedResult);
        };

        test(new Date('2018-04-19'), true);
        test(new Date('2018-04-01'), true);
        test(new Date('2018-05-01'), true);
        test(new Date('2018-05-19'), false);
    });
});
