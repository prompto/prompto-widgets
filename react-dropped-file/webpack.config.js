var path = require('path');

process.env.NODE_ENV = 'production';

module.exports = {
    entry: './src/DroppedFileWidget.js',
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
        filename: '../../../prompto-factory/CodeFactory/CodeFactory/src/main/resources/libraries/react-file-uploader/main.js',
        library: ['DroppedFileWidget'],
        libraryTarget: 'umd'
    },
    node: {
        module: "empty",
        net: "empty",
        fs: "empty"
    },
    mode: 'production',
    performance: {
        hints: false
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM'

    }
};
