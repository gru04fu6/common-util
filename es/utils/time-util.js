/**
 * 若是小於10則補0
 * @param {String} date 字串
 * @return {String} 字串
 */
function timePreFix(date) {
    if (+date < 10) {
        return `0${date}`;
    }
    return `${date}`;
}
function formatFunc(timeObj, format, UTC = false) {
    const year = UTC ? timeObj.getUTCFullYear() : timeObj.getFullYear();
    const month = (UTC ? timeObj.getUTCMonth() : timeObj.getMonth()) + 1;
    const day = UTC ? timeObj.getUTCDate() : timeObj.getDate();
    const hour = UTC ? timeObj.getUTCHours() : timeObj.getHours();
    const minute = UTC ? timeObj.getUTCMinutes() : timeObj.getMinutes();
    const second = UTC ? timeObj.getUTCSeconds() : timeObj.getSeconds();
    return format.replace(/(YYYY|MM|DD|HH|mm|ss)/g, match => {
        switch (match) {
            case 'YYYY':
                return `${year}`;
            case 'MM':
                return timePreFix(month);
            case 'DD':
                return timePreFix(day);
            case 'HH':
                return timePreFix(hour);
            case 'mm':
                return timePreFix(minute);
            case 'ss':
                return timePreFix(second);
            default:
                return match;
        }
    });
}
/**
 * 格式化日期(本地時間) 2017-05-05 - 07:07:07
 * @param {Object} timeObj 時間物件
 * @param {Boolean} format 格式化方式 目前僅支援 YYYY(年)、MM(月)、DD(日)、HH(時)、mm(分)、ss(秒) `default: 'YYYY-MM-DD HH:mm:ss'`
 * @return {String} 時間字串
 */
function formatTime(timeObj, format = 'YYYY-MM-DD HH:mm:ss') {
    return formatFunc(timeObj, format);
}
/**
 * 格式化日期(0時區時間) 2017-05-05 - 07:07:07
 * @param {Object} timeObj 時間物件
 * @param {Boolean} format 格式化方式 目前僅支援 YYYY(年)、MM(月)、DD(日)、HH(時)、mm(分)、ss(秒) `default: 'YYYY-MM-DD HH:mm:ss'`
 * @return {String} 時間字串
 */
function formatUTCTime(timeObj, format = 'YYYY-MM-DD HH:mm:ss') {
    return formatFunc(timeObj, format, true);
}
function translateFunction(timeZone, timeString = '', localToZone = false) {
    let transTime = timeString ? new Date(timeString) : new Date();
    let base = localToZone ? 1 : -1;
    if (Number.isNaN(transTime.getTime())) {
        transTime = new Date();
    }
    // eslint-disable-next-line
    const GMTTime = transTime.getTime() + ((transTime.getTimezoneOffset() * 60000) * base);
    return GMTTime + ((timeZone * 3600000) * base);
}
/**
 * 把本地時間轉換為其他時區時間
 * @param {Number} timeZone 要轉過去的時區
 * @param {String} timeString 時間字串
 * @return {Number} 時間戳 此時間戳顯示出來的本地時間就是轉過去的時區時間
 */
function localTimeToZone(timeZone, timeString = '') {
    return translateFunction(timeZone, timeString, true);
}
/**
 * 把其他時區時間轉換為本地時區
 * @param {Number} timeZone timeString的時區
 * @param {String} timeString 時間字串
 * @return {Number} 時間戳 此時間戳顯示出來的就是時間字串對應的本地時間
 */
function zoneTimeToLocal(timeZone, timeString = '') {
    return translateFunction(timeZone, timeString);
}
/**
 * 判斷時間大小並交換位置
 * @param  {String}    startDate 時間字串1
 * @param  {String}    endDate   時間字串2
 * @return {Array<String>}       時間字串陣列
 */
function checkDate(startDate, endDate) {
    const startTimestamp = Date.parse(startDate.replace(/-/g, '/'));
    const endTimestamp = Date.parse(endDate.replace(/-/g, '/'));
    // 如果開始時間大於結束時間, 就把時間調換
    if (startTimestamp > endTimestamp) {
        return [endDate, startDate];
    }
    return [startDate, endDate];
}

export { checkDate, formatTime, formatUTCTime, localTimeToZone, zoneTimeToLocal };
