/**
 * 節流
 * @param  {Function} fn    實際執行的函式
 * @param  {Number}   delay 節流時間(ms)，即在這段時間內不管執行幾次包裝後函式，實際的函式都僅會執行一次
 * @return {Function}       包裝後的函式
 */
export declare function throttle(fn: (...args: any[]) => void, delay: number): (this: any, ...args: any[]) => void;
/**
 * 防抖
 * @param  {Function} fn   實際執行的函式
 * @param  {Number}   wait 防抖時間(ms)，即在這段時間內沒有再次執行包裝後函式的話，實際的函式才會執行
 * @return {Function}      包裝後的函式
 */
export declare function debounce(fn: (...args: any[]) => void, wait: number): (this: any, ...args: any[]) => void;
/**
 * 將Promise物件重新包裝，回傳一個新的Promise，使其不管成功失敗都會回傳一個物件
 * 並利用物件的status來判斷結果
 * @param  {Promise} promiseObject Promise物件
 * @return {Promise} 重新包裝後的Promise，不管成功或失敗都會resolve一個物件
 */
export declare function toAsync<T>(promiseObject: Promise<T>): Promise<{
    status: boolean;
    response?: T;
    error?: any;
}>;
