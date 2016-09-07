var path = require('path');

module.exports = function (production) {
    var entries = {
        eventDrops: [
            path.join(__dirname, '../lib/eventDrops'),
            path.join(__dirname, '../style.css'),
        ]
    };

    if (!production) {
        /* D3 is defined as an external, but we need it for the demo. So, let's
        include it using the full path to trick Webpack. */
        entries['demo-d3'] = path.join(__dirname, '../node_modules/d3/d3.min.js');
        entries.demo = [
            path.join(__dirname, '../demo/demo.js'),
            path.join(__dirname, '../demo/demo.css'),
        ];

        entries.eventDrops.push('webpack-dev-server/client?http://localhost:8080');
    }

    return entries;
};
