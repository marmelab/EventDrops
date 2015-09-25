var path = require('path');

module.exports = function (production) {
    var entries = {
        eventDrops: [
            path.join(__dirname, '../lib/eventDrops')
        ]
    };

    if (!production) {
        entries.demo = [path.join(__dirname, '../demo/demo.js')];
    }

    return entries;
};
