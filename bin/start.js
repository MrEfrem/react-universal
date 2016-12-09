// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'development'

require('babel-register')

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({silent: true})

require('./server')
