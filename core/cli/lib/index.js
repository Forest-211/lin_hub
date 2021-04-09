'use strict'
const os = require('os')
const path = require('path')
const semver = require('semver')
const rootCheck = require('root-check')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const dotenv = require('dotenv')
const { Command } = require('commander')
const pkg = require('../package.json')
const constant = require('./constant')
const log = require('@lin-hub/log')
const init = require('@lin-hub/init')
const exec = require('@lin-hub/exec')
const { getNpmSemverVersion } = require('@lin-hub/get-npm-info')

const program = new Command()
async function core() {
    try {
        await prepare()
        registerCommand()
    } catch (err) {
        log.error(err.message)
        if (program.debug) {
            console.log(err)
        }
    }
}

async function prepare() {
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
    checkEnv()
    await checkGlobalUpdate()
}

function checkPkgVersion() {
    log.info(pkg.version)
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

function checkRoot() {
    const platform = []
    platform.push(os.platform())
    if (!platform.includes('win32')) {
        rootCheck()
    }
}

function checkUserHome() {
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red(`当前登录用户主目录不存在！`))
    }
}

function checkEnv() {
    const dotenvPath = path.resolve(userHome, '.env')
    if (pathExists(dotenvPath)) {
        dotenv.config({ path: dotenvPath })
    }
    createDefaultConfig()
}

function createDefaultConfig() {
    const cliConfig = {
        home: userHome,
    }
    cliConfig['cliHome'] = path.join(
        userHome,
        process.env.CLI_HOME ? process.env.CLI_HOME : constant.DEFAULT_CLI_HOME
    )
    process.env.CLI_HOME_PATH = cliConfig.cliHome
}

async function checkGlobalUpdate() {
    /**
     * Tasking：
     * - 获取当前版本号和模块名
     * - 调用npm API 获取所有得版本号
     * - 提取所有版本号，比对哪些版本号是大于当前版本号
     * - 获取最新版本号，提示用户更新该版本
     */
    const currentVersion = pkg.version
    const npmName = pkg.name
    const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
    if (lastVersion && semver.gt(lastVersion, currentVersion)) {
        log.warn(
            '更新提示',
            `请手动更新${npmName}，当前版本：${currentVersion}，最新版本：${lastVersion}
更新命令：npm install -g ${npmName}`
        )
    }
}

function registerCommand() {
    program
        .name(Object.keys(pkg.bin)[0])
        .usage('<command> [options]')
        .version(pkg.version, '-v,  --version', 'output the current version')
        .option('-d, --debug', '是否开启调试模式', false)
        .option(
            '-tp, --targetPath <targetPath>',
            '是否指定本地调试文件路径',
            ''
        )

    program
        .command('init [projectName]')
        .option('-f, --force', '是否强制初始化项目')
        .action(exec)

    // 开启debug模式
    program.on('option:debug', () => {
        process.env.LOG_LEVEL = program.opts().debug ? 'verbose' : 'info'
        log.level = process.env.LOG_LEVEL
    })

    // 指定targetPath
    program.on(
        'option:targetPath',
        () => (process.env.CLI_TARGET_PATH = program.opts().targetPath)
    )

    // 监听未知命令
    program.on('command:*', (obj) => {
        const availableCommands = program.commands.map((cmd) => cmd.name())
        console.log(colors.red(`未知的命令：${obj[0]}`))
        if (availableCommands.length)
            console.log(colors.red(`可用命令：${availableCommands.join(',')}`))
    })

    program.parse(process.argv)

    if (program.args && program.args.length < 1) {
        program.outputHelp()
        console.log()
    }
}
module.exports = core
