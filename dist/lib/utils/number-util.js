'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function formatMoney(num = 0, hasSymbol = false) {
  if (Number.isNaN(+num))
    return `${num}`;
  const symbol = +num > 0 && hasSymbol ? "+" : "";
  const [integerText = "", decimalText = ""] = `${num}`.split(".");
  const dotText = decimalText ? "." : "";
  return `${symbol}${integerText.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}${dotText}${decimalText}`;
}
function formatMoneyFixedTwo(num) {
  if (Number.isNaN(+num))
    return `${num}`;
  const decimal = `${num}`.split(".")[1] || "";
  if (decimal.length < 2) {
    return formatMoney(numberFormat(num, 2));
  }
  return formatMoney(num);
}
function formatOdds(num) {
  if (Number.isNaN(+num))
    return `${num}`;
  if (typeof num === "string")
    return num;
  return num.toFixed(2);
}
function numberDecimal(num, decimal = 2) {
  if (Number.isNaN(+num))
    return `${num}`;
  return (+num).toFixed(decimal);
}
function numberFormat(num, decimal = 2) {
  if (num === null || num === void 0 || num === "")
    return "";
  return formatMoney(numberDecimal(num, decimal));
}
function formatPercent(num, decimal = 2) {
  const percentNumber = accMul(+num, 100);
  return numberFormat(percentNumber, decimal);
}
function maybePercentText(text) {
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
function baseSorter(a, b, order = "ascend") {
  let result = 0;
  if (typeof a === "number" && typeof b === "number") {
    result = a - b;
  } else {
    const _a = maybePercentText(a).text;
    const _b = maybePercentText(b).text;
    const aValue = isNaN(+_a) ? a : +_a;
    const bValue = isNaN(+_b) ? b : +_b;
    if (aValue < bValue)
      result = -1;
    if (aValue > bValue)
      result = 1;
  }
  return order === "ascend" ? result : -result;
}
function accMul(arg1, arg2) {
  let pow = 0;
  const arguments1 = arg1.toString();
  const arguments2 = arg2.toString();
  try {
    pow += arguments1.split(".")[1].length;
  } catch (e) {
  }
  try {
    pow += arguments2.split(".")[1].length;
  } catch (e) {
  }
  return Number(arguments1.replace(".", "")) * Number(arguments2.replace(".", "")) / 10 ** pow;
}
function accDiv(arg1, arg2) {
  let t1 = 0;
  let t2 = 0;
  try {
    t1 = arg1.toString().split(".")[1].length;
  } catch (e) {
  }
  try {
    t2 = arg2.toString().split(".")[1].length;
  } catch (e) {
  }
  const r1 = Number(arg1.toString().replace(".", ""));
  const r2 = Number(arg2.toString().replace(".", ""));
  return accMul(r1 / r2, 10 ** (t2 - t1));
}
function sizeTransToBytes(sizeString = "") {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  for (const [index, size] of sizes.entries()) {
    if (~sizeString.indexOf(size)) {
      const sizeNumber = +sizeString.replace(size, "");
      return accMul(sizeNumber, 1024 ** index);
    }
  }
  return 0;
}
function bytesTranslate(bytes = 0) {
  const bytesLength = `${bytes}`.length;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const sizeBytesLength = [0, 4, 7, 10, 13];
  let sizeIndex = 0;
  while (sizeBytesLength[sizeIndex + 1] !== void 0 && bytesLength >= sizeBytesLength[sizeIndex + 1]) {
    sizeIndex += 1;
  }
  return `${+accDiv(bytes, 1024 ** sizeIndex).toFixed(2)}${sizes[sizeIndex]}`;
}

exports.accDiv = accDiv;
exports.accMul = accMul;
exports.baseSorter = baseSorter;
exports.bytesTranslate = bytesTranslate;
exports.formatMoney = formatMoney;
exports.formatMoneyFixedTwo = formatMoneyFixedTwo;
exports.formatOdds = formatOdds;
exports.formatPercent = formatPercent;
exports.maybePercentText = maybePercentText;
exports.numberDecimal = numberDecimal;
exports.numberFormat = numberFormat;
exports.sizeTransToBytes = sizeTransToBytes;
//# sourceMappingURL=number-util.js.map
