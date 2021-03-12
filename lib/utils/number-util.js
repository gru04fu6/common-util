'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * 金額格式化 - 每千位數加逗號
 * @param  {Number|String} num 欲格式化的數字
 * @param  {boolean} hasSymbol 是否有正號
 * @return {String}            格式化結果
 */
function formatMoney(num = 0, hasSymbol = false) {
    if (Number.isNaN(+num)) {
        return num;
    }
    const symbol = +num > 0 ? '+' : '';
    const number = `${num}`.split('.');
    return `${hasSymbol ? symbol : ''}${`${number[0]}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}${number[1] ? `.${number[1]}` : ''}`;
}
/**
 * 金額格式化 - 每千位數加逗號，小數不足兩位補0
 * @param  {Number|String} num 欲格式化的數字
 * @param  {boolean} hasSymbol 是否有正號
 * @return {String}            格式化結果
 */
function formatMoneyFixedTwo(value) {
    if (Number.isNaN(+value)) {
        return value;
    }
    const decimal = `${value}`.split('.')[1] || '';
    if (decimal.length < 2) {
        return formatMoney((+value).toFixed(2));
    }
    return formatMoney(value);
}
/**
 * 小數點到第二位
 * @param  {Number|String} num 欲格式化的數字
 * @return {String}            格式化結果
 */
function formatOdds(num) {
    if (typeof num === 'string') {
        return num;
    }
    return num.toFixed(2);
}
/**
 * 乘法
 * @param  {Number} arg1 乘數1
 * @param  {Number} arg2 乘數2
 * @return {Number}      乘數1 * 乘數2
 */
function accMul(arg1, arg2) {
    let pow = 0;
    const arguments1 = arg1.toString();
    const arguments2 = arg2.toString();
    // eslint-disable-next-line
    try {
        pow += arguments1.split('.')[1].length;
    }
    catch (e) { }
    // eslint-disable-next-line
    try {
        pow += arguments2.split('.')[1].length;
    }
    catch (e) { }
    return Number(arguments1.replace('.', '')) * Number(arguments2.replace('.', '')) / Math.pow(10, pow);
}
/**
 * 除法
 * @param  {Number} arg1 被除數
 * @param  {Number} arg2 除數
 * @return {Number}      被除數 / 除數
 */
function accDiv(arg1, arg2) {
    let t1 = 0;
    let t2 = 0;
    // eslint-disable-next-line
    try {
        t1 = arg1.toString().split('.')[1].length;
    }
    catch (e) { }
    // eslint-disable-next-line
    try {
        t2 = arg2.toString().split('.')[1].length;
    }
    catch (e) { }
    const r1 = Number(arg1.toString().replace('.', ''));
    const r2 = Number(arg2.toString().replace('.', ''));
    return accMul(r1 / r2, Math.pow(10, (t2 - t1)));
}
/**
 * 'KB', 'MB', 'GB', 'TB'轉換為Byte的大小
 * @param  {String} sizeString Byte大小 `example: '20.5GB' or '300KB'`
 */
function sizeTransToBytes(sizeString = '') {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    for (const [index, size] of sizes.entries()) {
        if (~sizeString.indexOf(size)) {
            const sizeNumber = +sizeString.replace(size, '');
            return accMul(sizeNumber, Math.pow(1024, index));
        }
    }
    return 0;
}
/**
 * Byte轉換為'KB', 'MB', 'GB', 'TB'等單位的大小
 * @param {Number} sizeString Byte大小
 */
function bytesTranslate(bytes = 0) {
    const bytesLength = `${bytes}`.length;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const sizeBytesLength = [0, 4, 7, 10, 13];
    let sizeIndex = 0;
    while (sizeBytesLength[sizeIndex + 1] !== undefined
        && (bytesLength >= sizeBytesLength[sizeIndex + 1])) {
        sizeIndex += 1;
    }
    return `${+accDiv(bytes, Math.pow(1024, sizeIndex)).toFixed(2)}${sizes[sizeIndex]}`;
}

exports.accDiv = accDiv;
exports.accMul = accMul;
exports.bytesTranslate = bytesTranslate;
exports.formatMoney = formatMoney;
exports.formatMoneyFixedTwo = formatMoneyFixedTwo;
exports.formatOdds = formatOdds;
exports.sizeTransToBytes = sizeTransToBytes;
