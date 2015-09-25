module.exports = {
    entry: {
        'eventDrops': [
            './lib/eventDrops.js'
        ]
    },
    output: {
        publicPath: 'http://localhost:8080',
        filename: 'dist/[name].js'
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
        ]
    }
};
