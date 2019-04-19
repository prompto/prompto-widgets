var path = require('path');

process.env.NODE_ENV = 'production';

module.exports = {
    entry: './react-bootstrap-3-widgets.js',
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
        filename: '../../../prompto-platform/Server/src/main/resources/js/widgets/react-bootstrap-3-widgets.js',
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
        'react-dom': 'ReactDOM',
        'react-bootstrap': 'ReactBootstrap',
        'prop-types': 'PropTypes',
        LocalDate: 'LocalDate',
        List: 'List',
        StrictSet: 'StrictSet',
        NativeError: 'NativeError',
        Utils: 'Utils'

    }
};
