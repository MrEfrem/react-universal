// @flow
import koa from 'koa'
import logger from 'koa-logger'
import favicon from 'koa-favicon'
import send from 'koa-send'
import path from 'path'
import render from './render'
import config from '../config'
import compress from 'koa-compress'

const app = koa()

// Logging requests/responses
app.use(logger())

// Compress response
app.use(compress())

// Implementation HMR
if (process.env.NODE_ENV === 'development') {
  const webpack = require('webpack')
  const webpackDevMiddleware = require('koa-webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const webpackConfig = require('../config/webpack.config.dev').default

  const compiler = webpack(webpackConfig)
  app.use(webpackDevMiddleware(compiler, {
    quiet: true,
    publicPath: config.webpack.publicPath,
    stats: {
      colors: true
    },
    watchOptions: {
      aggregateTimeout: 100
    }
  }))
  app.use(function* (next) {
    yield webpackHotMiddleware(compiler).bind(null, this.req, this.res)
    yield next
  })
}

// Server favicon
app.use(favicon(config.path.public + '/favicon.ico'))

// Function for server statics
const serveStatic = (root, opts = {}, baseName = '') => {
  const newOpts = { ...opts }
  newOpts.root = path.resolve(root)
  if (typeof newOpts.index !== 'undefined') newOpts.index = newOpts.index || 'index.html'
  return function* serve(next) {
    if ('/' !== this.path && (this.method === 'HEAD' || this.method === 'GET')) {
      let servePath = this.path
      if (typeof baseName === 'string' && baseName.length &&
          this.path.indexOf(baseName) === 0) {
        servePath = this.path.substr(baseName.length)
      }
      if (!servePath.length) {
        servePath = '/'
      }
      if (yield send(this, servePath, newOpts)) return
    }
    yield* next
  }
}

// Serve statics
const servePath = process.env.NODE_ENV === 'production' ? config.path.build : config.path.public
app.use(serveStatic(servePath, {
  index: '__IGNORE_INDEX.HTML__',
}, config.publicUrl))

// Render page
app.use(render)

export default app
