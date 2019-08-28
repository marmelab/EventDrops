import isWithinRange from 'date-fns/is_within_range';

export const withinRange = (date, dateBounds) => {
    const startingDate = Math.min(...dateBounds);
    const endingDate = Math.max(...dateBounds);

    // @TODO: remove the `new Date()` constructor in the next major version: we need to force it at configuration level.
    return isWithinRange(new Date(date), startingDate, endingDate);
};
