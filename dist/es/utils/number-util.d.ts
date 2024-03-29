/**
 * 金額格式化 - 每千位數加逗號
 * @param  {Number|String} num 欲格式化的數字
 * @param  {boolean} hasSymbol 是否有正號
 * @return {String}            格式化結果
 */
export declare function formatMoney(num?: string | number, hasSymbol?: boolean): string;
/**
 * 金額格式化 - 每千位數加逗號，小數不足兩位補0
 * @param  {Number|String} num 欲格式化的數字
 * @param  {boolean} hasSymbol 是否有正號
 * @return {String}            格式化結果
 */
export declare function formatMoneyFixedTwo(num: string | number): string;
/**
 * 小數點到第二位
 * @param  {Number|String} num 欲格式化的數字
 * @return {String}            格式化結果
 */
export declare function formatOdds(num: number | string): string;
/**
 * 小數點到特定位數
 */
export declare function numberDecimal(num: string | number, decimal?: number): string;
/**
 * 數字格式化，三位一撇+小數點到特定位數
 */
export declare function numberFormat(num?: string | number, decimal?: number): string;
/**
 * 將數值轉成百分比
 * @param decimal 補到小數點後第幾位, default: 2
 * @example 0.982 => 98.2
 */
export declare function formatPercent(num: string | number, decimal?: number): string;
/**
 * 檢查是不是百分比文字，若是的話將百分號拿掉
 */
export declare function maybePercentText(text: string | number): {
    text: string;
    isPercent: boolean;
};
/**
 * 基本的排序方法
 */
export declare function baseSorter(a: string | number, b: string | number, order?: 'descend' | 'ascend'): number;
/**
 * 乘法
 * @param  {Number} arg1 乘數1
 * @param  {Number} arg2 乘數2
 * @return {Number}      乘數1 * 乘數2
 */
export declare function accMul(arg1: number, arg2: number): number;
/**
 * 除法
 * @param  {Number} arg1 被除數
 * @param  {Number} arg2 除數
 * @return {Number}      被除數 / 除數
 */
export declare function accDiv(arg1: number, arg2: number): number;
/**
 * 'KB', 'MB', 'GB', 'TB'轉換為Byte的大小
 * @param  {String} sizeString Byte大小 `example: '20.5GB' or '300KB'`
 */
export declare function sizeTransToBytes(sizeString?: string): number;
/**
 * Byte轉換為'KB', 'MB', 'GB', 'TB'等單位的大小
 * @param {Number} sizeString Byte大小
 */
export declare function bytesTranslate(bytes?: number): string;
