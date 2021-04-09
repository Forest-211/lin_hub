'use strict'

const path = require('path')

function formatPath(p) {
    // TODO
    if (p && typeof p === 'string') {
        /**
         * windows系统上的分隔符是 \ maxOS系统上是 / 统一标准换成/
         */
        const sep = path.sep
        return sep === '/' ? p : p.replace(/\\/g, '/')
    }
    return p
}
module.exports = formatPath
