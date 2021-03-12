import { sleep } from '@common-util/test-utils';

import * as factoryUtil from '../factory-util';

describe('factory-util', () => {
    describe('throttle 節流函數', () => {
        test('延遲300毫秒', async () => {
            let result = 0;

            const throttleTest = factoryUtil.throttle(() => {
                result += 1;
            }, 300);

            throttleTest();
            expect(result).toBe(1);
            await sleep(100);
            throttleTest();
            expect(result).toBe(1);
            await sleep(201);
            expect(result).toBe(2);
            await sleep(300);
            throttleTest();
            expect(result).toBe(3);
        });
    });

    describe('debounce 防抖函數', () => {
        test('延遲300毫秒', async () => {
            let result = 0;

            const debounceTest = factoryUtil.debounce(() => {
                result += 1;
            }, 300);

            debounceTest();
            await sleep(200);
            expect(result).toBe(0);
            debounceTest();
            await sleep(200);
            expect(result).toBe(0);
            debounceTest();
            await sleep(400);
            expect(result).toBe(1);
        });

    });

    describe('toAsync 將Promise物件重新包裝', () => {
        test('Promise Resolve', async () => {
            const toAsyncTest = new Promise<number>(resolve => {
                setTimeout(() => resolve(1), 500);
            });

            const { status: resolveStatus, response } = await factoryUtil.toAsync(toAsyncTest);

            expect(resolveStatus).toBe(true);
            expect(response).toBe(1);
        });

        test('Promise Reject', async () => {
            const toAsyncTestReject = new Promise<number>((_, reject) => {
                setTimeout(() => reject(new Error('reject')), 500);
            });
            const { status: rejectStatus, error } = await factoryUtil.toAsync(toAsyncTestReject);

            expect(rejectStatus).toBe(false);
            expect(error).not.toBeUndefined();
        });
    });
});
