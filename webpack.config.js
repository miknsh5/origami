var webpack = require('webpack'),
    path = require('path'),
    CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
    devtool: 'source-map',
    entry: {
        'vendor': './app/vendor',
        'app': './app/main'
    },
    resolve: {
        extensions: ['', '.ts', '.js']
    },
    output: {
        path: __dirname,
        filename: './build/[name].bundle.js'
    },
    module: {
        preLoaders: [
            { test: /\.js$/, loader: 'source-map-loader', exclude: /node_modules/ }
        ],
        loaders: [
            { test: /\.ts$/, loader: 'awesome-typescript-loader', exclude: /node_modules/ },
            { test: /\.(html|css)$/, loader: 'raw-loader' }
        ]
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(true),
        new CleanWebpackPlugin(['build'], { root: __dirname, verbose: true, dry: false, exclude: [/node_modules/] })
    ],
    devServer: {
        historyApiFallback: true
    }
}