const path = require('path');
const target_dir = path.resolve(__dirname, "project/")

process.env.NODE_ENV = 'production';

module.exports = {
    entry: './react-bootstrap-4-widgets.js',
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
        path: target_dir,
        filename: 'main.js'
    },
    node: {
        module: "empty",
        net: "empty",
        fs: "empty"
    },
    mode: 'production',
    devtool: "source-map",
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
