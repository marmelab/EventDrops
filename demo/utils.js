const md5 = require('./md5');

// Example display: September 4 1986 8:30 PM
export const humanizeDate = (date) => {
    const monthNames = [
        'Jan.',
        'Feb.',
        'March',
        'Apr.',
        'May',
        'June',
        'Jul.',
        'Aug.',
        'Sept.',
        'Oct.',
        'Nov.',
        'Dec.',
    ];

    return `
        ${monthNames[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}
        ${date.getHours()}:${date.getMinutes()}
    `;
};

export const gravatar = email => `https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}`;
