'use strict'
const os = require('os')
const semver = require('semver')
const rootCheck = require('root-check')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const { error, notice } = require('@lin-hub/log')
const pkg = require('../package.json')
const constant = require('./constant')

function core() {
    try {
        checkPkgVersion()
        checkNodeVersion()
        checkRoot()
        checkUserHome()
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

function checkRoot(){
    /**
     * 获取用户得id
     */
    const platform = []
    platform.push(os.platform())
    if(!platform.includes('win32')){
        rootCheck()
    }
}

function checkUserHome(){
    if(!userHome || !pathExists(userHome)){
        throw new Error(colors.red(`当前登录用户主目录不存在！`))
    }
}
module.exports = core
