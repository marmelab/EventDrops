export const isAfter = (date, dateBounds) => {
    const endingDate = Math.max(...dateBounds);

    // @TODO: remove the `new Date()` constructor in the next major version: we need to force it at configuration level.
    return new Date(date) > endingDate;
};
