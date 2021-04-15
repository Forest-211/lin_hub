'use strict'
const path = require('path')
const cp = require('child_process')
const log = require('@lin-hub/log')
const Package = require('@lin-hub/package')

const SETTINGS = {
    init: '@lin-hub/int',
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
        try {
            // 当前进程中调用
            // require(rootFile).call(null, Array.from(arguments))
            // 子进程中调用
            const args = Array.from(arguments)
            const cmd = args[args.length - 1]
            const o = Object.create(null)
            // 排除私有属性和不必要的属性
            Object.keys(cmd).map((key) => {
                if (
                    cmd.hasOwnProperty(key) &&
                    !key.startsWith('_') &&
                    key !== 'parent'
                ) {
                    o[key] = cmd[key]
                }
            })
            
            args[args.length - 1] = o
            const code = `require('${rootFile}').call(null, ${JSON.stringify(
                args
            )})`
            const child = spawn('node', ['-e', code], {
                cwd: process.cwd(),
                stdio: 'inherit',
            })
            // 监听执行期间的错误信息
            child.on('error', (error) => {
                log.error(error.message)
                // 退出程序执行
                process.exit(1)
            })

            // 监听命令执行退出
            child.on('exit', (e) => {
                log.verbose('命令执行成功：', e)
                process.exit(e)
            })
        } catch (error) {
            log.error(error.message)
        }
    }
}

// 兼容windows
function spawn(command, args, options) {
    const win32 = process.platform === 'win32'
    const cmd = win32 ? 'cmd' : command
    const cmdArgs = win32 ? ['/c'].concat(command, args) : args
    return cp.spawn(cmd, cmdArgs, options || {})
}

module.exports = exec
