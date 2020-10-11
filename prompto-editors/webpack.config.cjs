const TerserPlugin = require('terser-webpack-plugin');
var path = require('path');
const target_dir = path.resolve(__dirname, "../../prompto-factory/CodeFactory/CodeFactory/src/main/resources/libraries/prompto-editors/");

const terser_options = {
    // do not mangle ProblemCollector to allow deriving it
    // terserOptions: { mangle: { keep_classnames: true, reserved: [ "ProblemCollector" ] } },
    // do not generate LICENSE file
    extractComments: false
};
const terser_plugin = new TerserPlugin(terser_options);

module.exports = {
    entry: './src/ResourceEditors.js',
    output: {
        globalObject: 'this',
        path: target_dir,
        filename: 'main.js'
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
                        'babel-loader',
                        "eslint-loader",
                        'webpack-conditional-loader'
                    ]
            }
        ]
    },
    mode: 'production',
    performance: {
        hints: false
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM'

    },
    devtool: "source-map"
};
