var path = require('path');
var webpack = require('webpack'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),
    CopyWebpackPlugin = require('copy-webpack-plugin');

var config = {
    cache: true,
    devtool: 'source-map',
    entry: {
        polyfills: './src/polyfills',
        vendor: './src/vendor',
        main: './src/main'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].bundle.js',
        sourceMapFilename: '[name].map',
        chunkFilename: '[id].chunk.js'
    },
    resolve: {
        extensions: ['', '.ts', '.tsx', '.js', '.jsx', '.png', '.gif']
    },
    module: {
        preLoaders: [
            { test: /\.js$/, loader: 'source-map-loader', exclude: /node_modules/ }
        ],
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' },
            { test: /\.json$/, loader: 'json-loader' },
            { test: /\.html/, loader: 'raw-loader' },
            { test: /\.css$/, loader: 'to-string-loader!css-loader' },
        ]
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(true),
        new webpack.optimize.CommonsChunkPlugin({ name: ['polyfills', 'vendor', 'main'].reverse(), minChunks: Infinity }),
        new CleanWebpackPlugin(['dist'], { root: __dirname, verbose: true, dry: false, exclude: [/node_modules/] }),
        new CopyWebpackPlugin([{
                from: path.join(__dirname, 'src/index.html'),
                to: path.join(__dirname, 'dist/index.html')
            },
            {
                from: path.join(__dirname, 'src/assets'),
                to: path.join(__dirname, 'dist/assets')
            },
            {
                from: path.join(__dirname, 'src/app'),
                to: path.join(__dirname, 'dist/app')
            },
        ], { ignore: ['*.ts'], })
    ],
    devServer: {
        historyApiFallback: true,
        outputPath: path.join(__dirname, 'dist'),
        watchOptions: { aggregateTimeout: 300, poll: 1000 }
    }
};
module.exports = config;