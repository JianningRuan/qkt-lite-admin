'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  EVN_CONFIG:'"dev"',
  // BASE_API: '"http://192.168.1.29:8999/mockjsdata/42"',
  // BASE_API: '"https://qkt-api-dev.uedu100.com"',
  // BASE_API: '"https://qkt-api-test.uedu100.com"', // https://qkt-api.uedu100.com
  BASE_API: '""',
})
