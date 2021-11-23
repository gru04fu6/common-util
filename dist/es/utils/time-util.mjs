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
  return format.replace(/(YYYY|MM|DD|HH|mm|ss)/g, (match) => {
    switch (match) {
      case "YYYY":
        return `${year}`;
      case "MM":
        return timePreFix(month);
      case "DD":
        return timePreFix(day);
      case "HH":
        return timePreFix(hour);
      case "mm":
        return timePreFix(minute);
      case "ss":
        return timePreFix(second);
      default:
        return match;
    }
  });
}
function formatTime(timeObj, format = "YYYY-MM-DD HH:mm:ss") {
  return formatFunc(timeObj, format);
}
function formatUTCTime(timeObj, format = "YYYY-MM-DD HH:mm:ss") {
  return formatFunc(timeObj, format, true);
}
function translateFunction(timeZone, timeString = "", localToZone = false) {
  let transTime = timeString ? new Date(timeString) : new Date();
  let base = localToZone ? 1 : -1;
  if (Number.isNaN(transTime.getTime())) {
    transTime = new Date();
  }
  const GMTTime = transTime.getTime() + transTime.getTimezoneOffset() * 6e4 * base;
  return GMTTime + timeZone * 36e5 * base;
}
function localTimeToZone(timeZone, timeString = "") {
  return translateFunction(timeZone, timeString, true);
}
function zoneTimeToLocal(timeZone, timeString = "") {
  return translateFunction(timeZone, timeString);
}
function checkDate(startDate, endDate) {
  const startTimestamp = Date.parse(startDate.replace(/-/g, "/"));
  const endTimestamp = Date.parse(endDate.replace(/-/g, "/"));
  if (startTimestamp > endTimestamp) {
    return [endDate, startDate];
  }
  return [startDate, endDate];
}

export { checkDate, formatTime, formatUTCTime, localTimeToZone, zoneTimeToLocal };
//# sourceMappingURL=time-util.mjs.map
