const path = require('path')
var webpack = require('webpack')
var CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
    entry: {
        'vendor': './app/vendor',
        'app': './app/main'
    },
    output: {
        path: __dirname,
        filename: './dist/[name].bundle.js'
    },
    resolve: {
        extensions: ['', '.ts', '.js']
    },
    devtool: 'source-map',
    module: {
        loaders: [{
                test: /\.ts/,
                loaders: ['ts-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.css/,
                loaders: ['style', 'css'],
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin( /* chunkName= */ 'vendor', /* filename= */ './dist/vendor.bundle.js'),
        new CleanWebpackPlugin(['dist', 'build'], { root: __dirname, verbose: true, dry: false, exclude: [] })
    ]
}