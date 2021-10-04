const path = require('path');
const nodeExternals = require('webpack-node-externals');

process.env.NODE_ENV = 'production';

module.exports = {
    entry: './src/index.js',
    target: "node",
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },
    externals: [nodeExternals()],
    mode: 'development',
    devtool: "source-map",
    performance: {
        hints: false
    }
};
