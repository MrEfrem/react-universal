import { enhanceStore } from 'redux-fly'
import { createStore } from 'redux'
import fs from 'fs'
import React from 'react'
import ReactDOM from 'react-dom/server'
import serialize from 'serialize-javascript'
import { Provider } from 'react-redux'
import config from '../config'
import qs from 'qs'
import { fetchCounter } from './api'
import styleSheet from 'styled-components/lib/models/StyleSheet'

const getTemplate = (markup, preloadedState, styles) => {
  const pathTemplate = process.env.NODE_ENV === 'production'
    ? config.path.buildTemplate
    : config.path.rawTemplate
  let template = fs.readFileSync(pathTemplate, 'utf-8')
  template = template.replace('<style></style>', `<style>${styles}</style>`)
  const replaces = [
    `<div id="root">${markup}</div>`,
    `<script>window.__PRELOADED_STATE__=${serialize(preloadedState)};</script>`,
  ]
  if (process.env.NODE_ENV === 'development') {
    replaces.push(
      `<script src="${config.webpack.publicPath}${config.webpack.fileName}?nocache=${Math.random()}"></script>`
    )
    return template
      .replace(
        '<div id="root"></div>', replaces.join('')
      )
      .replace(/%PUBLIC_URL%/g, config.publicUrl)
  }
  return template
    .replace(
      '<div id="root"></div>', replaces.join('')
    )
}

export default function* () {
  // Query our mock API asynchronously
  const apiResult = yield fetchCounter()

  // Read the counter from the request, if provided
  const params = qs.parse(this.query)
  const counter = parseInt(params.counter, 10) || apiResult || 0

  // Compile an initial state
  const initialState = { counter: { value: counter } }

  // Create a new Redux store instance
  const store = createStore(() => {}, initialState, enhanceStore)

  // Delete the App component cache for live editing
  if (process.env.NODE_ENV === 'development') {
    delete require.cache[require.resolve('../src/App')]
  }
  // Set PUBLIC_URL for access from React components
  process.env.PUBLIC_URL = config.publicUrl
  // Require App component from disk
  const App = require('../src/App').default

  // Render the component to a string
  const markup = ReactDOM.renderToString(
    <Provider store={store}>
      <App/>
    </Provider>
  )
  const styles = styleSheet.rules().map(rule => rule.cssText).join('\n')

  // Grab the initial state from our Redux store
  const finalState = store.getState()

  // Send the rendered page back to the client
  this.body = getTemplate(markup, finalState, styles)
}
