'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var R = require('ramda');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var R__namespace = /*#__PURE__*/_interopNamespace(R);

function setPropertyByPath(target, path, value) {
  if (!path) {
    console.warn("path \u4E0D\u53EF\u70BA\u7A7A\u503C");
    return;
  }
  const pathArray = path.split(".");
  let findTarget = target;
  while (pathArray.length > 1) {
    if (findTarget[pathArray[0]] === void 0) {
      findTarget[pathArray[0]] = {};
    }
    findTarget = findTarget[pathArray.shift()];
    if (!(findTarget instanceof Object)) {
      console.warn(`\u5C6C\u6027 '${String(pathArray[0])}' \u975E\u7269\u4EF6\u985E\u5225`);
      return;
    }
  }
  findTarget[pathArray[0]] = value;
}
function getPropertyByPath(target, path) {
  const pathArray = path.split(".");
  let findTarget = target;
  try {
    while (pathArray.length > 0) {
      findTarget = findTarget[pathArray.shift()];
    }
    return findTarget;
  } catch (e) {
    console.warn("\u5F9E\u7269\u4EF6", target, `\u4E0A\u53D6\u8DEF\u5F91'${path}'\u5931\u6557`);
    return void 0;
  }
}
function objHasProperty(obj, prop) {
  return Object.hasOwnProperty.call(obj, prop);
}
function dataIsSet(obj) {
  return Object.keys(obj).length > 0;
}
function isTwoLayArray(array) {
  for (const subArray of array.values()) {
    if (Array.isArray(subArray)) {
      return true;
    }
  }
  return false;
}
function jsonArrayCovert(jsonString) {
  let array = [];
  try {
    array = JSON.parse(jsonString);
  } catch (e) {
    console.warn(`jsonArrayCovert => \`${jsonString}\` fail`);
  }
  return array;
}
function zeroValueObject(obj, needClone = true) {
  const newObj = needClone ? R__namespace.clone(obj) : obj;
  R__namespace.forEachObjIndexed((value, key) => {
    switch (typeof newObj[key]) {
      case "number":
        newObj[key] = 0;
        break;
      case "string":
        newObj[key] = "";
        break;
      case "boolean":
        newObj[key] = false;
        break;
      case "object":
        if (Object.keys(newObj[key]).length) {
          newObj[key] = zeroValueObject(newObj[key], false);
        }
        break;
      default:
        break;
    }
  }, newObj);
  return newObj;
}
function checkZeroObject(obj, excludeKey = {}) {
  let valid = true;
  R__namespace.forEachObjIndexed((item, key) => {
    if (objHasProperty(excludeKey, key) && excludeKey[key])
      return;
    if (typeof item === "object") {
      if (!checkZeroObject(item)) {
        valid = false;
      }
    } else if (item) {
      valid = false;
    }
  }, obj);
  return valid;
}
function setValueByStruct(structObject, source) {
  Object.keys(structObject).forEach((key) => {
    if (objHasProperty(source, key)) {
      structObject[key] = source[key];
    }
  });
}

exports.checkZeroObject = checkZeroObject;
exports.dataIsSet = dataIsSet;
exports.getPropertyByPath = getPropertyByPath;
exports.isTwoLayArray = isTwoLayArray;
exports.jsonArrayCovert = jsonArrayCovert;
exports.objHasProperty = objHasProperty;
exports.setPropertyByPath = setPropertyByPath;
exports.setValueByStruct = setValueByStruct;
exports.zeroValueObject = zeroValueObject;
//# sourceMappingURL=object-util.js.map
