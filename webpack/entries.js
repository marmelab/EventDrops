var path = require('path');

module.exports = function (production) {
    
    var entries = {
        eventDrops : [
                path.join(__dirname, '../style.css')
        ]
    };
    if (!production) {
        entries.demo = [
            path.join(__dirname, '../demo/demo.js'),
            path.join(__dirname, '../demo/demo.css'),
        ];

        entries.eventDrops.push('webpack-dev-server/client?http://localhost:8080');
    }
    else{
        entries.eventDrops.push(path.join(__dirname, '../lib/eventDrops'));
    }
    
    return entries;
};
