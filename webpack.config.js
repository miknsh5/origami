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
        extensions: ['', '.ts', '.js', '.png', '.gif']
    },
    output: {
        path: __dirname,
        filename: './dist/[name].bundle.js'
    },
    module: {
        preLoaders: [
            { test: /\.js$/, loader: 'source-map-loader', exclude: /node_modules/ }
        ],
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader', exclude: /node_modules/ },
            { test: /\.(html|css|png|gif)$/, loader: 'raw-loader' }
        ]
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(true),
        new webpack.optimize.CommonsChunkPlugin( /* chunkName= */ 'vendor', /* filename= */ './dist/vendor.bundle.js'),
        new CleanWebpackPlugin(['build', 'dist'], { root: __dirname, verbose: true, dry: false, exclude: [/node_modules/] })
    ],
    devServer: {
        historyApiFallback: true
    }
}