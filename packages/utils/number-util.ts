/**
 * 金額格式化 - 每千位數加逗號
 * @param  {Number|String} num 欲格式化的數字
 * @param  {boolean} hasSymbol 是否有正號
 * @return {String}            格式化結果
 */
export function formatMoney(num: string | number = 0, hasSymbol = false) {
    if (Number.isNaN(+num)) return `${num}`;

    const symbol = +num > 0 && hasSymbol ? '+' : '';
    const [integerText = '', decimalText = ''] = `${num}`.split('.');
    const dotText = decimalText ? '.' : '';

    return `${symbol}${integerText.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}${dotText}${decimalText}`;
}

/**
 * 金額格式化 - 每千位數加逗號，小數不足兩位補0
 * @param  {Number|String} num 欲格式化的數字
 * @param  {boolean} hasSymbol 是否有正號
 * @return {String}            格式化結果
 */
export function formatMoneyFixedTwo(num: string | number) {
    if (Number.isNaN(+num)) return `${num}`;

    const decimal = `${num}`.split('.')[1] || '';
    if (decimal.length < 2) {
        return formatMoney(numberFormat(num, 2));
    }

    return formatMoney(num);
}

/**
 * 小數點到第二位
 * @param  {Number|String} num 欲格式化的數字
 * @return {String}            格式化結果
 */
export function formatOdds(num: number | string) {
    if (Number.isNaN(+num)) return `${num}`;
    if (typeof num === 'string') return num;

    return num.toFixed(2);
}

/**
 * 小數點到特定位數
 */
export function numberDecimal(num: string | number, decimal = 2) {
    if (Number.isNaN(+num)) return `${num}`;
    return (+num).toFixed(decimal);
}

/**
 * 數字格式化，三位一撇+小數點到特定位數
 */
export function numberFormat(num?: string | number, decimal = 2) {
    if (num === null || num === undefined || num === '') return '';
    return formatMoney(numberDecimal(num, decimal));
}

/**
 * 將數值轉成百分比
 * @param decimal 補到小數點後第幾位, default: 2
 * @example 0.982 => 98.2
 */
export function formatPercent(num: string | number, decimal = 2) {
    const percentNumber = accMul(+num, 100);
    return numberFormat(percentNumber, decimal);
}

/**
 * 檢查是不是百分比文字，若是的話將百分號拿掉
 */
export function maybePercentText(text: string | number) {
    const percentText = `${text}`;
    const percentRegResult = /^(-?[\d]*(\.[\d]+)?)%$/.exec(percentText);

    if (!percentRegResult) {
        return {
            text: percentText,
            isPercent: false
        };
    }

    return {
        text: percentRegResult[1],
        isPercent: true
    };
}

/**
 * 基本的排序方法
 */
export function baseSorter(a: string | number, b: string | number, order: 'descend' | 'ascend' = 'ascend') {
    let result = 0;

    if (typeof a === 'number' && typeof b === 'number') {
        result = a - b;
    } else {
        const _a = maybePercentText(a).text;
        const _b = maybePercentText(b).text;

        const aValue = isNaN(+_a) ? a : +_a;
        const bValue = isNaN(+_b) ? b : +_b;

        if (aValue < bValue) result = -1;
        if (aValue > bValue) result = 1;
    }

    return order === 'ascend' ? result : -result;
}

/**
 * 乘法
 * @param  {Number} arg1 乘數1
 * @param  {Number} arg2 乘數2
 * @return {Number}      乘數1 * 乘數2
 */
export function accMul(arg1: number, arg2: number) {
    let pow = 0;
    const arguments1 = arg1.toString();
    const arguments2 = arg2.toString();
    // eslint-disable-next-line
    try { pow += arguments1.split('.')[1].length; } catch (e) {}
    // eslint-disable-next-line
    try { pow += arguments2.split('.')[1].length; } catch (e) {}
    return Number(arguments1.replace('.', '')) * Number(arguments2.replace('.', '')) / 10 ** pow;
}

/**
 * 除法
 * @param  {Number} arg1 被除數
 * @param  {Number} arg2 除數
 * @return {Number}      被除數 / 除數
 */
export function accDiv(arg1: number, arg2: number) {
    let t1 = 0;
    let t2 = 0;
    // eslint-disable-next-line
    try { t1 = arg1.toString().split('.')[1].length; } catch (e) {}
    // eslint-disable-next-line
    try { t2 = arg2.toString().split('.')[1].length; } catch (e) {}
    const r1 = Number(arg1.toString().replace('.', ''));
    const r2 = Number(arg2.toString().replace('.', ''));
    return accMul(r1 / r2, 10 ** (t2 - t1));
}

/**
 * 'KB', 'MB', 'GB', 'TB'轉換為Byte的大小
 * @param  {String} sizeString Byte大小 `example: '20.5GB' or '300KB'`
 */
export function sizeTransToBytes(sizeString = '') {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    for (const [index, size] of sizes.entries()) {
        if (~sizeString.indexOf(size)) {
            const sizeNumber = +sizeString.replace(size, '');
            return accMul(sizeNumber, 1024 ** index);
        }
    }
    return 0;
}

/**
 * Byte轉換為'KB', 'MB', 'GB', 'TB'等單位的大小
 * @param {Number} sizeString Byte大小
 */
export function bytesTranslate(bytes: number = 0): string {
    const bytesLength = `${bytes}`.length;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const sizeBytesLength = [0, 4, 7, 10, 13];
    let sizeIndex = 0;

    while (sizeBytesLength[sizeIndex + 1] !== undefined
        && (bytesLength >= sizeBytesLength[sizeIndex + 1])
    ) {
        sizeIndex += 1;
    }

    return `${+accDiv(bytes, 1024 ** sizeIndex).toFixed(2)}${sizes[sizeIndex]}`;
}
