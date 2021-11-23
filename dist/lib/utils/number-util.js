'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function formatMoney(num = 0, hasSymbol = false) {
  if (Number.isNaN(+num)) {
    return num;
  }
  const symbol = +num > 0 ? "+" : "";
  const number = `${num}`.split(".");
  return `${hasSymbol ? symbol : ""}${`${number[0]}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}${number[1] ? `.${number[1]}` : ""}`;
}
function formatMoneyFixedTwo(value) {
  if (Number.isNaN(+value)) {
    return value;
  }
  const decimal = `${value}`.split(".")[1] || "";
  if (decimal.length < 2) {
    return formatMoney((+value).toFixed(2));
  }
  return formatMoney(value);
}
function formatOdds(num) {
  if (typeof num === "string") {
    return num;
  }
  return num.toFixed(2);
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
exports.bytesTranslate = bytesTranslate;
exports.formatMoney = formatMoney;
exports.formatMoneyFixedTwo = formatMoneyFixedTwo;
exports.formatOdds = formatOdds;
exports.sizeTransToBytes = sizeTransToBytes;
//# sourceMappingURL=number-util.js.map
