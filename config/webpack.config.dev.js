import webpack from 'webpack'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import config from './index'
import getClientEnvironment from './env'

// Get environment variables to inject into our app.
const env = getClientEnvironment(config.publicUrl)

// Assert this just to be safe.
if (env['process.env'].NODE_ENV !== '"development"') {
  throw new Error('Development builds must have NODE_ENV=development.')
}

const webpackConfig = {
  // You may want 'eval' instead if you prefer to see the compiled output in DevTools.
  // See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
  devtool: 'cheap-module-source-map',
  entry: [
    `webpack-hot-middleware/client`,
    // We ship a few polyfills by default:
    require.resolve('./polyfills'),
    // Finally, this is your app's code:
    config.path.entry
    // We include the app code last so that if there is a runtime error during
    // initialization, it doesn't blow up the WebpackDevServer client, and
    // changing JS code would still trigger a refresh.
  ],
  output: {
    // Next line is not used in dev but WebpackDevServer crashes without it:
    path: config.path.build,
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: config.webpack.fileName,
    // This is the URL that app is served from. We use "/" in development.
    publicPath: config.webpack.publicPath,
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
    new webpack.DefinePlugin(env),
    // This is necessary to emit hot updates.
    new webpack.HotModuleReplacementPlugin(),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
    new webpack.NoErrorsPlugin()
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
          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: true,
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
