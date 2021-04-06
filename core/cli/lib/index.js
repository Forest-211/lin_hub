'use strict'
const os = require('os')
const path = require('path')
const semver = require('semver')
const rootCheck = require('root-check')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const minimist = require('minimist')
const dotenv = require('dotenv')
const log = require('@lin-hub/log')
const pkg = require('../package.json')
const constant = require('./constant')
const { getNpmInfo } = require('@lin-hub/get-npm-info')

let args, config
function core() {
    try {
        checkPkgVersion()
        checkNodeVersion()
        checkRoot()
        checkUserHome()
        checkInputArgs()
        checkEnv()
        checkGlobalUpdate()
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
    checkArgs()
}

function checkArgs(){
    process.env.LOG_LEVEL = args.debug ? 'verbose' : 'info'
    log.level = process.env.LOG_LEVEL
}

function checkEnv(){
    const dotenvPath = path.resolve(userHome, '.env')
    if(pathExists(dotenvPath)){
        config = dotenv.config({path: dotenvPath})
    }
    createDefaultConfig()
    log.verbose('环境变量：', process.env.CLI_HOME_PATH)
}

function createDefaultConfig(){
    const cliConfig = {
        home: userHome
    }
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME ? process.env.CLI_HOME : constant.DEFAULT_CLI_HOME)
    process.env.CLI_HOME_PATH = cliConfig.cliHome
}

function checkGlobalUpdate(){
    /**
     * Tasking：
     * - 获取当前版本号和模块名
     * - 调用npm API 获取所有得版本号
     * - 提取所有爸妈本号，比对那些版本号是大于当前版本号
     * - 获取最新版本号，提示用户更新该版本
     */
    const currentVersion = pkg.version
    const npmName = pkg.name
     getNpmInfo(npmName)
}
module.exports = core
