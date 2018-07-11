import { isBefore } from './isBefore';

describe('isBefore', () => {
    it('should return true if date is before given date range', () => {
        const dateRange = [new Date('2018-04-01'), new Date('2018-05-01')];
        const test = (date, expectedResult) => {
            expect(isBefore(date, dateRange)).toBe(expectedResult);
        };

        test('2018-01-01', true);
        test('2018-05-19', false);
        test('2018-05-01', false);
        test('2018-04-19', false);
        test('2018-04-01', false);
    });

    it('should return true if date is before given reverse date range (start date older than end date)', () => {
        const dateRange = [new Date('2018-05-01'), new Date('2018-04-01')];
        const test = (date, expectedResult) => {
            expect(isBefore(date, dateRange)).toBe(expectedResult);
        };

        test('2018-01-01', true);
        test('2018-05-19', false);
        test('2018-05-01', false);
        test('2018-04-19', false);
        test('2018-04-01', false);
    });
});
