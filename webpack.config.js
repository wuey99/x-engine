/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");

const merge = require("webpack-merge").merge;

// plugins
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env) => {
    const config = {
        entry: './src/scripts/app.ts',
        // entry: "./src/index.ts",

        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
            // alias: {
            //     // Force CommonJS for PixiJS since some modules are not ES6 compatible
            //     "pixi.js": path.resolve(__dirname, "node_modules/pixi.js/dist/cjs/pixi.min.js"),
            // },
        },

        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                        },
                        "css-loader",
                    ],
                },
            ],
        },
        optimization: {
            splitChunks: {
                chunks: "all",
            },
        },

        plugins: [
            new HtmlWebpackPlugin(),
            new CopyPlugin({
                patterns: [
			{ from: 'src/css/style.css', to: 'css/' },
			{ from: 'src/images', to: 'images' },
			{ from: 'src/assets/sprites', to: 'sprites' },
			{ from: 'src/assets/Cows/Project', to: 'assets' },
                ],
            }),
        ],
    };
    const envConfig = require(path.resolve(__dirname, `./webpack.${env.mode}.js`))(env);

    const mergedConfig = merge(config, envConfig);

    return mergedConfig;
};

