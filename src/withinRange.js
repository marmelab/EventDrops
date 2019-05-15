import isWithinRange from 'date-fns/is_within_range';

export const withinRange = (date, dateBounds) => {
    const startingDate = Math.min(...dateBounds);
    const endingDate = Math.max(...dateBounds);

    return isWithinRange(date, startingDate, endingDate);
};
