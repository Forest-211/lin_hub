'use strict'
const semver = require('semver')
const colors = require('colors/safe')
const { info, error, notice } = require('@lin-hub/log')
const pkg = require('../package.json')
const constant = require('./constant')

function core() {
    try {
        checkPkgVersion()
        checkNodeVersion()
    } catch (err) {
        error(err.message)
    }
}

function checkPkgVersion() {
    notice(pkg.version)
}

function checkNodeVersion() {
    /**
     * Tasking
     * - 获取当前node版本号 process.version
     * - 比对最低版本号
     */
    const currentVersion = process.version
    const lowestVersion = constant.LOWEST_NODE_VERSION
    if (!semver.gte(currentVersion, lowestVersion)) {
        throw new Error(
            colors.red(`lin-hub 需要安装v${lowestVersion}以上版本的Node.js`)
        )
    }
}

module.exports = core
