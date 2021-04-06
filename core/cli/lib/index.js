'use strict'
const os = require('os')
const semver = require('semver')
const rootCheck = require('root-check')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const minimist = require('minimist')
const log = require('@lin-hub/log')
const pkg = require('../package.json')
const constant = require('./constant')

let args
function core() {
    try {
        checkPkgVersion()
        checkNodeVersion()
        checkRoot()
        checkUserHome()
        checkInputArgs()
        log.verbose('debug', 'test debug log')
    } catch (err) {
        log.error(err.message)
    }
}

function checkPkgVersion() {
    log.notice(pkg.version)
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

function checkInputArgs(){
    args = minimist(process.argv.slice(2))
    console.log(args)
    checkArgs()
}

function checkArgs(){
    process.env.LOG_LEVEL = args.debug ? 'verbose' : 'info'
    log.level = process.env.LOG_LEVEL
}

module.exports = core
