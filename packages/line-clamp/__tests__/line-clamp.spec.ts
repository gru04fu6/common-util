import { sleep } from '@common-util/test-utils';
import lineClampFactory from '../index';

describe('line-clamp', () => {
    const clampAttr = 'test-line-clamp';
    const paddingAttr = 'test-dot-padding';

    let testContent: HTMLElement;
    let lineClamp: ReturnType<typeof lineClampFactory>;

    const useNotWebkit = () => {
        const style = {
            ...document.body.style
        };
        delete style.webkitLineClamp;

        Object.defineProperty(document.body, 'style', {
            configurable: true,
            value: style
        });

        lineClamp = lineClampFactory(
            clampAttr,
            paddingAttr
        );
    };

    const useWebkit = () => {
        Object.defineProperty(document.body, 'style', {
            configurable: true,
            value: {
                ...document.body.style,
                webkitLineClamp: ''
            }
        });

        lineClamp = lineClampFactory(
            clampAttr,
            paddingAttr
        );
    };

    const useOverflowText = () => {
        Object.defineProperties(testContent, {
            scrollHeight: {
                value: 300
            },
            getBoundingClientRect: {
                value: () => ({
                    height: 200
                })
            }
        });
    };

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="testContent"></div>
        `;
        testContent = document.querySelector('#testContent');
    });

    test('添加初始樣式', () => {
        useNotWebkit();

        lineClamp.addInitStyle(testContent);
        expect(testContent.style.textOverflow).toBe('ellipsis');
    });

    test('添加attribute', async () => {
        useNotWebkit();

        lineClamp.truncateText(testContent, {
            lineCount: '4'
        });

        expect(testContent.getAttribute(clampAttr)).not.toBeNull();
    });

    describe('webkit瀏覽器', () => {
        test('設定 webkitLineClamp', async () => {
            useWebkit();

            lineClamp.truncateText(testContent, {
                lineCount: '4'
            });

            await sleep(50);
            expect(testContent.style.webkitLineClamp).toBe('4');
        });
    });

    describe('非webkit瀏覽器', () => {
        test('未觸發截斷縮寫', async () => {
            useNotWebkit();

            lineClamp.truncateText(testContent, {
                lineCount: '4'
            });

            await sleep(50);
            expect(testContent.querySelector('span')).toBeNull();
        });

        test('執行第二次才觸發截斷縮寫', async () => {
            useNotWebkit();
            lineClamp.truncateText(testContent, {
                lineCount: '4'
            });

            useOverflowText();
            lineClamp.truncateText(testContent, {
                lineCount: '4'
            });

            await sleep(50);
            expect(testContent.querySelector('span')).not.toBeNull();
        });

        test('觸發截斷縮寫', async () => {
            useNotWebkit();
            useOverflowText();

            lineClamp.truncateText(testContent, {
                lineCount: '4'
            });

            await sleep(50);
            expect(testContent.querySelector('span')).not.toBeNull();
        });

        test('傳入非法line', () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation();

            lineClamp.truncateText(testContent, {
                lineCount: 'aaa'
            });

            expect(consoleError).toBeCalled();
        });

        test('設定css lineHeight', async () => {
            useNotWebkit();
            useOverflowText();
            testContent.style.lineHeight = '20px';

            lineClamp.truncateText(testContent, {
                lineCount: '4'
            });
            await sleep(50);

            expect(testContent.style.maxHeight).toBe('80px');
            expect(testContent.getAttribute(paddingAttr)).toBe('60');
            expect(testContent.querySelector('span').style.height).toBe('60px');
        });

        test('傳入非法lineHeight', () => {
            const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();

            lineClamp.truncateText(testContent, {
                lineCount: '4',
                lineHeight: 'aaa'
            });

            expect(consoleWarn).toBeCalled();
        });

        test('傳入lineHeight', async () => {
            useNotWebkit();
            useOverflowText();

            lineClamp.truncateText(testContent, {
                lineCount: '4',
                lineHeight: '16'
            });
            await sleep(50);

            expect(testContent.style.maxHeight).toBe('64px');
            expect(testContent.getAttribute(paddingAttr)).toBe('48');
            expect(testContent.querySelector('span').style.height).toBe('48px');
        });
    });
});
