import { triggerEvent, sleep } from '@common-util/test-utils';
import * as tapEvent from '../index';

describe('tap-event', () => {
    const callback = jest.fn();
    let button: HTMLElement;

    const generateTouchEvent = async (inTime: boolean, inRange: boolean, sameDom = true) => {
        const time = inTime ? 200 : 400;
        const range = inRange ? 5 : 11;

        triggerEvent(button, 'touchstart', {
            touches: [{ clientX: 1, clientY: 1 }],
            changedTouches: [{ clientX: 1, clientY: 1 }],
            currentTarget: button
        });
        await sleep(time);
        return triggerEvent(button, 'touchend', {
            touches: [{ clientX: range, clientY: range }],
            changedTouches: [{ clientX: range, clientY: range }],
            currentTarget: sameDom ? button : document.createElement('button')
        });
    };

    const clickEnv = (modifiers?: tapEvent.Modifiers) => {
        delete document.ontouchend;
        tapEvent.bindTap(button, callback, modifiers);
    };

    const touchEnv = (modifiers?: tapEvent.Modifiers) => {
        Object.defineProperty(document, 'ontouchend', {
            value: 123
        });
        tapEvent.bindTap(button, callback, modifiers);
    };

    beforeEach(() => {
        document.body.innerHTML = `
            <button id="test-btn" style="width: 100px; height: 100px" />
        `;
        button = document.querySelector('#test-btn') as HTMLElement;
        callback.mockClear();
    });

    afterEach(() => {
        tapEvent.unbindTap(button);
    });

    describe('click事件', () => {
        test('綁定', () => {
            clickEnv();

            triggerEvent(button, 'click');
            expect(callback).toBeCalled();
        });

        test('modifiers', async () => {
            clickEnv({
                once: true,
                prevent: true,
                stop: true
            });

            const event = triggerEvent(button, 'click');
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).toBeCalled();

            await sleep(0);
            triggerEvent(button, 'click');
            expect(callback).toBeCalledTimes(1);
        });

        test('解除綁定', () => {
            clickEnv();

            triggerEvent(button, 'click');
            tapEvent.unbindTap(button, callback);
            triggerEvent(button, 'click');
            expect(callback).toBeCalledTimes(1);
        });
    });

    describe('touch事件', () => {
        test('綁定', async () => {
            touchEnv();

            await generateTouchEvent(true, true);
            expect(callback).toBeCalled();
        });

        test('按下後拖動超過10px', async () => {
            touchEnv();

            await generateTouchEvent(true, false);
            expect(callback).not.toBeCalled();
        });

        test('按下超過300毫秒才放開', async () => {
            touchEnv();

            await generateTouchEvent(false, true);
            expect(callback).not.toBeCalled();
        });

        test('modifier', async () => {
            touchEnv({
                once: true,
                prevent: true,
                stop: true,
                self: true
            });

            const event = await generateTouchEvent(true, true, false);
            expect(event.preventDefault).toBeCalled();
            expect(event.stopPropagation).toBeCalled();
            expect(callback).not.toBeCalled();

            await generateTouchEvent(true, true);
            await sleep(0);
            await generateTouchEvent(true, true);
            expect(callback).toBeCalledTimes(1);
        });

        test('解除綁定', async () => {
            touchEnv();

            await generateTouchEvent(true, true);
            tapEvent.unbindTap(button);
            await generateTouchEvent(true, true);
            expect(callback).toBeCalledTimes(1);
        });
    });
});
