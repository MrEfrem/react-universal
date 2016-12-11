import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import InterpolateHtmlPlugin from 'react-dev-utils/InterpolateHtmlPlugin'
import config from './index'
import getClientEnvironment from './env'
import ManifestPlugin from 'webpack-manifest-plugin'

// Get environment variables to inject into our app.
const env = getClientEnvironment(config.publicUrl)

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env['process.env'].NODE_ENV !== '"production"') {
  throw new Error('Production builds must have NODE_ENV=production.')
}

const webpackConfig = {
  // Don't attempt to continue if there are any errors.
  bail: true,
  // We generate sourcemaps in production. This is slow but gives good results.
  // You can exclude the *.map files from the build during deployment.
  devtool: 'source-map',
  entry: [
    require.resolve('./polyfills'),
    config.path.entry
  ],
  output: {
    // The build folder.
    path: config.path.build,
    // Generated JS file names (with nested folders).
    // There will be one main bundle, and one file per asynchronous chunk.
    // We don't currently advertise code splitting but Webpack supports it.
    filename: 'static/js/[name].[chunkhash:8].js',
    chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
    // We inferred the "public path" (such as / or /my-project) from homepage.
    publicPath: config.webpack.publicPath,
  },
  plugins: [
    // Makes the public URL available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In development, this will be an empty string.
    new InterpolateHtmlPlugin({
      PUBLIC_URL: config.publicUrl
    }),
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: config.path.rawTemplate,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
    // It is absolutely essential that NODE_ENV was set to production here.
    // Otherwise React will be compiled in the very slow development mode.
    new webpack.DefinePlugin(env),
    // This helps ensure the builds are consistent if source hasn't changed:
    new webpack.optimize.OccurrenceOrderPlugin(),
    // Try to dedupe duplicated modules, if any:
    new webpack.optimize.DedupePlugin(),
    // Minify the code.
    new webpack.optimize.UglifyJsPlugin({
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
    }),
    // Generate a manifest file which contains a mapping of all asset filenames
    // to their corresponding output file so that tools can pick it up without
    // having to parse `index.html`.
    new ManifestPlugin({
      fileName: 'asset-manifest.json'
    })
  ],
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    // First, run the linter.
    // It's important to do this before Babel processes the JS.
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        include: config.path.src
      }
    ],
    loaders: [
      // Process JS with Babel.
      {
        test: /\.js$/,
        include: config.path.src,
        loader: 'babel',
        query: {
          presets: [
            'latest',
            'react'
          ],
          plugins: [
            // class { handleClick = () => { } }
            'transform-class-properties',
            // The following two plugins use Object.assign directly, instead of Babel's
            // extends helper. Note that this assumes `Object.assign` is available.
            // { ...todo, completed: true }
            ['transform-object-rest-spread', {
              useBuiltIns: true
            }],
            // Transforms JSX
            ['transform-react-jsx', {
              useBuiltIns: true
            }],
            // function* () { yield 42; yield 43; }
            ['transform-regenerator', {
              // Async functions are converted to generators by babel-preset-latest
              async: false
            }],
            // Polyfills the runtime needed for async/await and generators
            ['transform-runtime', {
              helpers: false,
              polyfill: false,
              regenerator: true
            }],
            'transform-react-jsx-source',
            'transform-react-jsx-self'
          ]
        }
      }
    ]
  }
}

export default webpackConfig
