'use strict'

const { info, success, notice } = require('@lin-hub/log')
const pkg = require('../package.json')

module.exports = core

function core() {
    checkPkgVersion()
}

function checkPkgVersion() {
    notice(pkg.version)
}
