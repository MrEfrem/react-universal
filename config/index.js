import path from 'path'
import fs from 'fs'
import url from 'url'

const config = { path: {} }

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
config.path.project = fs.realpathSync(process.cwd())
config.resolve = (relativePath = '') =>  path.resolve(config.path.project, relativePath)

config.path.build = config.resolve('build')
config.path.buildTemplate = config.resolve('build/index.html')
config.path.entry = config.resolve('src/index.js'),
config.path.packageJSON = config.resolve('package.json'),
config.path.public = config.resolve('public')
config.path.rawTemplate = config.resolve('public/index.html')
config.path.src = config.resolve('src')
config.path.yarnLockFile = config.resolve('yarn.lock')

config.node = {
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 3000
}

config.webpack = {
  publicPath: '/static/',
  fileName: 'js/bundle.js'
}

const ensureSlash = (path, needsSlash) => {
  const hasSlash = path.endsWith('/')
  if (hasSlash && !needsSlash) {
    return path.substr(path, path.length - 1)
  } else if (!hasSlash && needsSlash) {
    return path + '/'
  } else {
    return path
  }
}

config.publicUrl = ''
if (process.env.NODE_ENV === 'production') {
  // We use "homepage" field to infer "public path" at which the app is served.
  // Webpack needs to know it to put the right <script> hrefs into HTML even in
  // single-page apps that may serve index.html for nested URLs like /todos/42.
  // We can't use a relative path in HTML because we don't want to load something
  // like /todos/42/static/js/bundle.7289d.js. We have to know the root.
  const homepagePath = require(config.path.packageJSON).homepage
  const homepagePathname = homepagePath ? url.parse(homepagePath).pathname : '/'
  // Webpack uses `publicPath` to determine where the app is being served from.
  // It requires a trailing slash, or the file assets will get an incorrect path.
  config.webpack.publicPath = ensureSlash(homepagePathname, true)
  // `publicUrl` is just like `publicPath`, but we will provide it to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
  config.publicUrl = ensureSlash(homepagePathname, false)
}

export default config
