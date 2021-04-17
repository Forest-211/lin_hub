'use strict'
const fs = require('fs')
const fse = require('fs-extra')
const semver = require('semver')
const inquirer = require('inquirer')
const Command = require('@lin-hub/command')
const log = require('@lin-hub/log')

const TYPE_PROJECT = 'project'
const TYPE_COMPONENT = 'component'

class InitCommand extends Command {
    init() {
        this.projectName = this._argv[0] || ''
        this.force = !!this._cmd[1].force
        log.verbose('projectName:', this.projectName)
        log.verbose('force:', this.force)
    }

    async exec() {
        try {
            // 准备阶段
            const projectInfo = await this.prepare()
            if (projectInfo) {
                log.verbose('projectInfo:', projectInfo)
                this.downloadTemplate()
                // 下载模板
                // 安装模板
            }
        } catch (error) {
            log.error(error.message)
        }
    }

    async prepare() {
        const localPath = process.cwd()
        // 1、判断当前目录是否为空
        if (!this.isDirEmpty(localPath)) {
            let isContinue = false
            if (!this.force) {
                // 询问是否继续创建 inquirer
                isContinue = (
                    await inquirer.prompt({
                        type: 'confirm',
                        name: 'isContinue',
                        message: '当前文件夹不为空，是否继续创建项目？',
                        default: false,
                    })
                ).isContinue
                if (!isContinue) return
            }
            // 2、是否启动强制更新
            if (isContinue || this.force) {
                // 给用户二次确认是否清空
                const { confirmDelete } = await inquirer.prompt({
                    type: 'confirm',
                    name: 'confirmDelete',
                    message: '是否确认清空当前目录下的所有文件及文件夹？',
                    default: false,
                })
                // 请空当前目录
                if (confirmDelete) fse.emptyDirSync(localPath)
            }
        }
        return this.getProjectInfo()
    }

    isDirEmpty(localPath) {
        // 忽略以点开头的文件和node_modules文件夹
        let fileList = fs
            .readdirSync(localPath)
            .filter(
                (file) =>
                    !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
            )
        return !fileList || fileList.length <= 0
    }

    async getProjectInfo() {
        function isValidName(v) {
            return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(
                v
            )
        }
        let projectInfo = {}
        // 1、选择创建项目或者组件
        const { type } = await inquirer.prompt({
            type: 'list',
            name: 'type',
            message: '请选择初始化类型',
            default: TYPE_PROJECT,
            choices: [
                { name: '项目', value: TYPE_PROJECT },
                { name: '组件', value: TYPE_COMPONENT },
            ],
        })
        log.verbose('type', type)
        switch (type) {
            case TYPE_PROJECT:
                // 2、获取项目的基本信息
                const project = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'projectName',
                        message: '请输入项目名称',
                        default: '',
                        validate(v) {
                            // 1、输入的首字符必须为英文字符
                            // 2、尾字符必须英文或数字、不能为字符
                            // 3、字符仅允许 - _
                            const done = this.async()

                            setTimeout(() => {
                                if (
                                    !/^[a-zA-Z]+([-][a-zA-Z0-9][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(
                                        v
                                    )
                                ) {
                                    done('请输入合法的项目名称')
                                }
                                done(null, true)
                            }, 0)
                            return /^[a-zA-Z]+([-][a-zA-Z0-9][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(
                                v
                            )
                        },
                        filter(v) {
                            return !!semver.valid(v) ? semver.valid(v) : v
                        },
                    },
                    {
                        type: 'input',
                        name: 'projectVersion',
                        message: '请输入项目版本号',
                        default: '1.0.0',
                        validate(v) {
                            const done = this.async()
                            setTimeout(function () {
                                if (!!!semver.valid(v)) {
                                    done('请输入合法的版本号')
                                    return
                                }
                                done(null, true)
                            }, 0)
                        },
                        filter(v) {
                            return !!semver.valid(v) ? semver.valid(v) : v
                        },
                    },
                ])
                projectInfo = {
                    type,
                    ...project,
                }
                break
            case TYPE_COMPONENT:
                break
        }
        return projectInfo
    }

    downloadTemplate() {
        // 1、通过项目模板api获取项目模板信息
        // 1.1、通过egg.js搭建一套后端系统
        // 1.2、通过npm存储项目模板
        // 1.3、将项目模板信息存储到MongoDB数据库中
        // 1.4、通过egg.js获取MongoDB数据库的数据并且通过api返回
    }
}

function init(argv) {
    // console.log('init', projectName, cmdObj.force, process.env.CLI_TARGET_PATH)
    return new InitCommand(argv)
}
module.exports = init
module.exports.InitCommand = InitCommand
