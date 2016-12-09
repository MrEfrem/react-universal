// Assert this just to be safe.
if (typeof process.env.NODE_ENV === 'undefined') {
  throw new Error('NODE_ENV must be specified')
}

import server from '../server'
import config from '../config'
import chalk from 'chalk'

const isInteractive = process.stdout.isTTY

function run(port) {
  server.listen(port, config.node.host)
  global.console.log()
  global.console.log('The app is running at:')
  global.console.log()
  global.console.log('  ' + chalk.cyan('http://' + config.node.host + ':' + port + '/'))
  global.console.log()

  if (process.env.NODE_ENV === 'development' && isInteractive) {
    const openBrowser = require('react-dev-utils/openBrowser')
    openBrowser('http://' + config.node.host + ':' + port + '/')
  }
}

// Start koa in development mode with detect busy port
if (process.env.NODE_ENV === 'development') {
  const prompt = require('react-dev-utils/prompt')
  const detect = require('detect-port')
  const getProcessForPort = require('react-dev-utils/getProcessForPort')
  const clearConsole = require('react-dev-utils/clearConsole')

  const ignore = new RegExp(
    `(\\/\\.|~$|\\.json$|^${config.path.project.replace('/', '\\/')}\\/src\\/)`, 'i')
  if (require('piping')({ hook: true, ignore })) {
    detect(config.node.port).then(port => {
      if (port === config.node.port) {
        run(port)
        return
      }

      if (isInteractive) {
        clearConsole()
        const existingProcess = getProcessForPort(config.node.port)
        const question =
          chalk.yellow('Something is already running on port ' + config.node.port + '.' +
            ((existingProcess) ? ' Probably:\n  ' + existingProcess : '')) +
            '\n\nWould you like to run the app on another port instead (quit by ctrl-c)?'

        prompt(question, true).then(shouldChangePort => {
          if (shouldChangePort) {
            run(port)
          }
        })
      } else {
        global.console.log(chalk.red('Something is already running on port ' + config.node.port + '.'))
      }
    })
  }
} else {
  // Start koa in production mode
  run(config.node.port)
}
