var PRODUCTION = process.argv[2] === '-p';

module.exports = {
    entry: require('./webpack/entries')(PRODUCTION),
    output: {
        publicPath: '',
        path: 'dist/',
        filename: '[name].js',
        library: 'eventDrops'
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
        ]
    },
    externals: {
        d3: 'd3'
    },
    plugins: require('./webpack/plugins')(PRODUCTION)
};
