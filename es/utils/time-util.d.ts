/**
 * 格式化日期(本地時間) 2017-05-05 - 07:07:07
 * @param {Object} timeObj 時間物件
 * @param {Boolean} format 格式化方式 目前僅支援 YYYY(年)、MM(月)、DD(日)、HH(時)、mm(分)、ss(秒) `default: 'YYYY-MM-DD - HH:mm:ss'`
 * @return {String} 時間字串
 */
export declare function formatTime(timeObj: Date, format?: string): string;
/**
 * 格式化日期(0時區時間) 2017-05-05 - 07:07:07
 * @param {Object} timeObj 時間物件
 * @param {Boolean} format 格式化方式 目前僅支援 YYYY(年)、MM(月)、DD(日)、HH(時)、mm(分)、ss(秒) `default: 'YYYY-MM-DD - HH:mm:ss'`
 * @return {String} 時間字串
 */
export declare function formatUTCTime(timeObj: Date, format?: string): string;
/**
 * 把本地時間轉換為其他時區時間
 * @param {Number} timeZone 要轉過去的時區
 * @param {String} timeString 時間字串
 * @return {Number} 時間戳 此時間戳顯示出來的本地時間就是轉過去的時區時間
 */
export declare function localTimeToZone(timeZone: number, timeString?: string): number;
/**
 * 把其他時區時間轉換為本地時區
 * @param {Number} timeZone timeString的時區
 * @param {String} timeString 時間字串
 * @return {Number} 時間戳 此時間戳顯示出來的就是時間字串對應的本地時間
 */
export declare function zoneTimeToLocal(timeZone: number, timeString?: string): number;
/**
 * 判斷時間大小並交換位置
 * @param  {String}    startDate 時間字串1
 * @param  {String}    endDate   時間字串2
 * @return {Array<String>}       時間字串陣列
 */
export declare function checkDate(startDate: string, endDate: string): string[];
