const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin")
const CleanWebpackPlugin = require('clean-webpack-plugin');

const env = {
    'NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
     )
}

// const isProduction = (process.env.NODE_ENV || 'development') === 'production'
const isProduction = true

const getPlugins = () => {
    const plugins = [
        new webpack.DefinePlugin(env),
        // This helps ensure the builds are consistent if source hasn't changed:
        new webpack.optimize.OccurrenceOrderPlugin(),
        // Try to dedupe duplicated modules, if any:
        new webpack.optimize.DedupePlugin(),
        // Create file with common plugins/modules
        new CommonsChunkPlugin(isProduction ? "infraestructure.[chunkhash:8].js" : 'infraestructure.js', ['index']),
        // Chunk files
        new ExtractTextPlugin(isProduction ? "css/[name].[chunkhash:8].css" : "css/[name].css", {
            allChunks: true
        })
    ]

    if (isProduction) {
        // Clear dist folder
        plugins.push(new CleanWebpackPlugin(['dist'], {
            root: __dirname,
            verbose: true,
            dry: false
        }))

        // Minify
        plugins.push(new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true, // React doesn't support IE8
                warnings: false
            },
            mangle: {
                screw_ie8: true
            },
            output: {
                comments: false,
                screw_ie8: true
            }
        }))
    }

    return plugins
}

const getPostCSSPlugins = () => {
    const plugins = [
        require('autoprefixer')({
            browsers: ['last 2 versions']
        })
    ]

    if (isProduction) {
        plugins.push(
            require('cssnano')
        )
    }

    return plugins
}

module.exports = {
    cache: true,

    resolve: {
        root: [path.resolve(__dirname, 'js'), path.resolve(__dirname, 'node_modules')],
        extensions: ['', '.jsx', '.js', '.json']
    },

    context: __dirname,

    entry: {
        index: './src/index'
    },

    output: {
        path: './dist',
		filename: isProduction ? '[name].[chunkhash:8].js' : '[name].js'
    },

    module: {
        loaders: [
            {
                // JS
				test: /(\.js|\.jsx)$/,
				include: [
					/src/
				],
				loaders: ['babel']
			},
            {
                // SCSS Styles
                test: /\.scss$/,
                include: [
                    /scss/
                ],
                loader: ExtractTextPlugin.extract(
                    'style-loader', ["css-loader", 'postcss-loader', 'sass-loader']
                ),

            }
        ]
    },

    sassLoader: {
        includePaths: [path.resolve(__dirname, "node_modules")]
    },

    postcss: getPostCSSPlugins(),

    plugins: getPlugins()
}
