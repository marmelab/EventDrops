import dateIsAfter from 'date-fns/is_after';

export const isAfter = (date, dateBounds) => {
    const endingDate = Math.max(...dateBounds);
    return dateIsAfter(new Date(date), endingDate);
};
