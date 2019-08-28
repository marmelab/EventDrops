import dateIsAfter from 'date-fns/is_after';

export const isAfter = (date, dateBounds) => {
    const endingDate = Math.max(...dateBounds);

    // @TODO: remove the `new Date()` constructor in the next major version: we need to force it at configuration level.
    return dateIsAfter(new Date(date), endingDate);
};
