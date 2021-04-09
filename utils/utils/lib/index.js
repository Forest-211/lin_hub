'use strict'

/**
 * @description 判断是否是对象
 * @param {*} o 待校验参数
 * @returns boolean
 */
function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]'
}

module.exports = { isObject }
