declare type Join<K, P> = K extends string | number ? P extends string | number ? `${K}${'' extends P ? '' : '.'}${P}` : never : never;
declare type Prev = [
    never,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    ...0[]
];
declare type Paths<T, D extends number = 5> = [D] extends [never] ? never : T extends Record<string, any> ? {
    [K in keyof T]-?: K extends string | number ? `${K}` | Join<K, Paths<T[K], Prev[D]>> : never;
}[keyof T] : '';
/**
 * 根據路徑設定屬性
 * @param {Object} target 設定屬性的目標
 * @param {String} path 屬性的路徑 => 'aaa.bbb.ccc'
 * @param {Any} value 屬性的新值
 */
export declare function setPropertyByPath<T extends Record<string, any>>(target: T, path: Paths<T>, value: any): void;
/**
 * 根據路徑取得屬性
 * @param {Object} target 取屬性的目標
 * @param {String} path 屬性的路徑 => 'aaa.bbb.ccc'
 * @return {Any} 取到的屬性值, 若沒取到就是undefined
 */
export declare function getPropertyByPath<T extends Record<string, any>>(target: T, path: Paths<T>): any;
/**
 * 檢查物件是否擁有某個key
 * @param obj 物件
 * @param prop key
 * @return {Boolean}
 */
export declare function objHasProperty<X extends Record<string, any>, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown>;
/**
 * 檢查是否非空物件，檢查成功會把所有可選屬性都變成必須
 * 但實際上不一定，要注意檢查空值
 * @param obj 物件
 * @return {Boolean}
 */
export declare function dataIsSet<X extends Record<string, any>>(obj: X): obj is X & Required<X>;
/**
 * 檢查是否為兩層或以上的陣列
 *
 * @param obj 物件
 * @return {Boolean}
 */
export declare function isTwoLayArray(array: any[]): array is any[][];
/**
 * JSON字串轉換成陣列
 * 失敗的話回傳空陣列，注意`不會檢查轉換的結果是否符合泛型`
 * @param jsonString json字串
 */
export declare function jsonArrayCovert<T>(jsonString: string): T[];
/**
 * 將物件所有屬性設定為zeroValue，
 * 只會轉換 `number`、`string`、`boolean`屬性
 * @param obj 物件
 */
export declare function zeroValueObject<T extends Record<string, any>>(obj: T, needClone?: boolean): T;
/**
 * 測試物件裡所有key的值都是zeroValue
 * 多層物件會一直遞迴找到非 `object` 型態的屬性為止
 * @param obj 物件
 * @param excludeKey 要跳過檢查的key
 */
export declare function checkZeroObject<T extends Record<string, any>>(obj: T, excludeKey?: Record<string, boolean>): boolean;
export {};
