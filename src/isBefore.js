import dateIsBefore from 'date-fns/is_before';

export const isBefore = (date, dateBounds) => {
    const startingDate = Math.min(...dateBounds);

    // @TODO: remove the `new Date()` constructor in the next major version: we need to force it at configuration level.
    return dateIsBefore(new Date(date), startingDate);
};
