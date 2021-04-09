'use strict'
const path = require('path')
const log = require('@lin-hub/log')
const Package = require('@lin-hub/package')

const SETTINGS = {
    init: 'vue', // @lin-hub/int
}

const CACHE_DIR = 'dependencies'
async function exec() {
    /**
     * Tasking
     * - 获取targetPath --> 指向模块路径
     * - 模块路径 --> 指向npm模块
     * - 获取入口文件路径 Package.getRootFile(获取入口文件)
     * - 安装依赖(Package.install)、更新依赖(package.update)
     */
    let targetPath = process.env.CLI_TARGET_PATH
    const homePath = process.env.CLI_HOME_PATH

    // debug模式下打印
    log.verbose('targetPath:', targetPath)
    log.verbose('homePath:', homePath)

    // 缓存地址
    let storeDir = ''
    let pkg

    // 获取名称和版本
    const cmdObj = arguments[arguments.length - 1]
    const cmdName = cmdObj.name()
    const packageName = SETTINGS[cmdName]
    const packageVersion = 'latest'

    if (!targetPath) {
        targetPath = path.resolve(homePath, CACHE_DIR) // 生成缓存路径
        storeDir = path.resolve(targetPath, 'node_modules')

        log.verbose('targetPath', targetPath)
        log.verbose('storeDir', storeDir)

        pkg = new Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion,
        })

        if (await pkg.exists()) {
            // 更新package
            await pkg.update()
        } else {
            // 安装package
            await pkg.install()
        }
    } else {
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion,
        })
    }
    const rootFile = pkg.getRootFilePath()
    if (rootFile) {
        require(rootFile).apply(null, arguments)
    }
}

module.exports = exec
