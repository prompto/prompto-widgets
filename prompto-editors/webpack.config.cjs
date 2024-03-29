const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
// eslint-disable-next-line no-undef
const target_dir = path.resolve(__dirname, "../../prompto-factory/CodeFactory/CodeFactory/src/main/resources/ide/");

const terser_options = {
    // do not mangle ProblemCollector to allow deriving it
    // terserOptions: { mangle: { keep_classnames: true, reserved: [ "ProblemCollector" ] } },
    // do not generate LICENSE file
    extractComments: false
};
const terser_plugin = new TerserPlugin(terser_options);

// eslint-disable-next-line no-undef
module.exports = {
    entry: './src/ResourceEditors.js',
    output: {
        globalObject: 'this',
        path: target_dir,
        filename: 'main.js',
        library: ['ResourceEditors'],
        libraryTarget: 'umd'
    },
    node: {
        module: "empty",
        net: "empty",
        fs: "empty"
    },
    optimization: {
        minimizer : [ terser_plugin ]
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: [
                        "babel-loader",
                        "eslint-loader",
                        "webpack-conditional-loader"
                    ]
            }
        ]
    },
    mode: 'production',
    performance: {
        hints: false
    },
    plugins: [
        new CompressionPlugin()
    ],
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM'

    },
    devtool: "source-map"
};
