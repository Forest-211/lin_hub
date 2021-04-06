#! /usr/bin/env node
const importLocal = require('import-local')
const { info } = require('npmlog')
const cli = require('../lib')

// 版本打印
importLocal(__filename)
    ? info('lin-hub', '正在使用 lin-hub 本地版本')
    : cli(process.argv.slice(2))
