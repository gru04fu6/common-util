import { clone, forEachObjIndexed } from 'ramda';

/**
 * 根據路徑設定屬性
 * @param {Object} target 設定屬性的目標
 * @param {String} path 屬性的路徑 => 'aaa.bbb.ccc'
 * @param {Any} value 屬性的新值
 */
function setPropertyByPath(target, path, value) {
    const pathArray = path.split('.');
    let findTarget = target;
    while (pathArray.length > 1) {
        // 如果路經中間遇到undefined, 就產生空物件
        if (findTarget[pathArray[0]] === undefined) {
            findTarget[pathArray[0]] = {};
        }
        findTarget = findTarget[pathArray.shift()];
    }
    findTarget[pathArray[0]] = value;
}
/**
 * 根據路徑取得屬性
 * @param {Object} target 取屬性的目標
 * @param {String} path 屬性的路徑 => 'aaa.bbb.ccc'
 * @return {Any} 取到的屬性值, 若沒取到就是undefined
 */
function getPropertyByPath(target, path) {
    const pathArray = path.split('.');
    let findTarget = target;
    try {
        while (pathArray.length > 0) {
            findTarget = findTarget[pathArray.shift()];
        }
        return findTarget;
    }
    catch (e) {
        // eslint-disable-next-line
        console.warn('從物件', target, `上取路徑'${path}'失敗`);
        return undefined;
    }
}
/**
 * 檢查物件是否擁有某個key
 * @param obj 物件
 * @param prop key
 * @return {Boolean}
 */
function objHasProperty(obj, prop) {
    return Object.hasOwnProperty.call(obj, prop);
}
/**
 * 檢查是不是空物件，檢查成功會把所有可選屬性都變成必須
 * 但實際上不一定，要注意檢查空值
 * @param obj 物件
 * @return {Boolean}
 */
function dataIsSet(obj) {
    return Object.keys(obj).length > 0;
}
/**
 * 檢查是否為兩層的陣列
 *
 * @param obj 物件
 * @return {Boolean}
 */
function isTwoLayArray(array) {
    for (const subArray of array.values()) {
        if (Array.isArray(subArray)) {
            return true;
        }
    }
    return false;
}
/**
 * JSON字串轉換成陣列
 * 失敗的話回傳空陣列，注意`不會檢查轉換的結果是否符合泛型`
 * @param jsonString json字串
 */
function jsonArrayCovert(jsonString) {
    let array = [];
    try {
        array = JSON.parse(jsonString);
    }
    catch (e) {
        // eslint-disable-next-line
        console.warn(`jsonArrayCovert => \`${jsonString}\` fail`);
    }
    return array;
}
/**
 * 將物件所有屬性設定為zeroValue，
 * 只會轉換第一層的 `number`、`string`、`boolean`屬性
 * @param obj 物件
 */
function zeroValueObject(obj) {
    const newObj = clone(obj);
    forEachObjIndexed((value, key) => {
        switch (typeof newObj[key]) {
            case 'number':
                newObj[key] = 0;
                break;
            case 'string':
                newObj[key] = '';
                break;
            case 'boolean':
                newObj[key] = false;
                break;
        }
    }, newObj);
    return newObj;
}
/**
 * 測試物件裡所有key的值都是zeroValue
 * 多層物件會一直遞迴找到非 `object` 型態的屬性為止
 * @param obj 物件
 * @param excludeKey 要跳過檢查的key
 */
function checkZeroObject(obj, excludeKey = {}) {
    let valid = true;
    forEachObjIndexed((item, key) => {
        if (objHasProperty(excludeKey, key) && excludeKey[key])
            return;
        if (typeof item === 'object') {
            if (!checkZeroObject(item)) {
                valid = false;
            }
        }
        else if (item) {
            valid = false;
        }
    }, obj);
    return valid;
}

export { checkZeroObject, dataIsSet, getPropertyByPath, isTwoLayArray, jsonArrayCovert, objHasProperty, setPropertyByPath, zeroValueObject };
