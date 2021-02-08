
/**
 * 節流
 * @param  {Function} fn    實際執行的函式
 * @param  {Number}   delay 節流時間(ms)，即在這段時間內不管執行幾次包裝後函式，實際的函式都僅會執行一次
 * @return {Function}       包裝後的函式
 */
export function throttle(fn: (...args: any[]) => void, delay: number) {
    let timer: number;
    let prevTime: number;

    return function (this: any, ...args: any[]) {
        const currTime = Date.now();
        const context = this;

        if (!prevTime) prevTime = currTime;
        clearTimeout(timer);

        if (currTime - prevTime > delay) {
            prevTime = currTime;
            fn.apply(context, args);
            clearTimeout(timer);
            return;
        }

        timer = window.setTimeout(function () {
            prevTime = Date.now();
            timer = 0;
            fn.apply(context, args);
        }, delay);
    };
}

/**
 * 防抖
 * @param  {Function} fn   實際執行的函式
 * @param  {Number}   wait 防抖時間(ms)，即在這段時間內沒有再次執行包裝後函式的話，實際的函式才會執行
 * @return {Function}      包裝後的函式
 */
export function debounce(fn: (...args: any[]) => void, wait: number) {
    let timeout: number | undefined;

    return function (this: any, ...args: any[]) {
        const context = this;

        clearTimeout(timeout);
        timeout = window.setTimeout(function () {
            timeout = undefined;
            fn.apply(context, args);
        }, wait);
    };
}

/**
 * 將Promise物件重新包裝，回傳一個新的Promise，使其不管成功失敗都會回傳一個物件
 * 並利用物件的status來判斷結果
 * @param  {Promise} promiseObject Promise物件
 * @return {Promise} 重新包裝後的Promise，不管成功或失敗都會resolve一個物件
 */
export function toAsync<T>(promiseObject: Promise<T>): Promise<{
    status: boolean,
    response?: T,
    error?: any
}> {
    return new Promise(resolve => {
        promiseObject
            .then((res: T) => {
                resolve({
                    status: true,
                    response: res
                });
            })
            .catch((e: any) => {
                resolve({
                    status: false,
                    error: e
                });
            });
    });
}