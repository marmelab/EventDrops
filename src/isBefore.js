import dateIsBefore from 'date-fns/is_before';

export const isBefore = (date, dateBounds) => {
    const startingDate = Math.min(...dateBounds);
    return dateIsBefore(new Date(date), startingDate);
};
