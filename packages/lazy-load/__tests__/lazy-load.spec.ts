
import { makeScroll, defineGetter, sleep } from '@common-util/test-utils';

import lazyLoadFactory from '../index';

const testImgUrl = 'https://path/to/image';
const loadingImageUrl = 'https://path/to/loadingImage';

describe('lazy-load', () => {
    let lazyLoadSrc: ReturnType<typeof lazyLoadFactory>;
    let lazyLoadBg: ReturnType<typeof lazyLoadFactory>;
    let testImgSrc: HTMLElement;
    let testImgBg: HTMLElement;

    const initLazyLoad = () => {
        lazyLoadSrc = lazyLoadFactory({
            lazyAttr: 'lazy-test-src',
            loadType: 'src',
            loadingPath: loadingImageUrl
        });
        lazyLoadBg = lazyLoadFactory({
            lazyAttr: 'lazy-test-bg',
            loadType: 'background',
            loadingPath: loadingImageUrl
        });
    };

    const useInterObserver = () => {
        require('intersection-observer');
        initLazyLoad();
    };

    const useNoInterObserver = () => {
        delete window.IntersectionObserver;
        initLazyLoad();
    };

    beforeEach(() => {
        document.body.innerHTML = `
            <img id="testImgSrc" style="overflow-y: hidden" />
            <img id="testImgBg" style="overflow-y: hidden" />
        `;
        testImgSrc = document.querySelector('#testImgSrc');
        testImgBg = document.querySelector('#testImgBg');

        document.scrollingElement.scrollTop = 0;
    });

    beforeAll(() => {
        defineGetter(document, 'scrollingElement', document.documentElement);

        HTMLImageElement.prototype.getBoundingClientRect = function() {
            const rect = {
                top: this.offsetTop - document.scrollingElement.scrollTop,
                right: 100,
                bottom: this.offsetTop - document.scrollingElement.scrollTop + 100,
                left: 0,
                width: 100,
                height: 100,
                x: 0,
                y: this.offsetTop - document.scrollingElement.scrollTop
            };
            return {
                ...rect,
                toJSON() {
                    return rect;
                }
            };
        };
        Object.defineProperties(document.scrollingElement, {
            getBoundingClientRect: {
                configurable: true,
                value: () => ({
                    top: -document.scrollingElement.scrollTop,
                    right: 800,
                    bottom: 600 - document.scrollingElement.scrollTop,
                    left: 0,
                    width: 800,
                    height: 600
                })
            },
            clientWidth: {
                value: 800
            },
            clientHeight: {
                value: 600
            }
        });
    });

    const scrollAndLoad = async () => {
        defineGetter(testImgSrc, 'offsetTop', 800);
        defineGetter(testImgBg, 'offsetTop', 800);

        lazyLoadSrc.bindLazyLoad(testImgSrc, {
            imageUrl: testImgUrl
        });
        lazyLoadBg.bindLazyLoad(testImgBg, {
            imageUrl: testImgUrl
        });

        await makeScroll(document.scrollingElement, 'scrollTop', 100);

        expect(testImgSrc.getAttribute('src')).toBe(loadingImageUrl);
        expect(testImgBg.style.backgroundImage).toBe(`url(${loadingImageUrl})`);

        await makeScroll(document.scrollingElement, 'scrollTop', 300);
        // 因lazy節流延遲500毫秒，等550毫秒後再進行驗證
        await sleep(550);

        expect(testImgSrc.getAttribute('src')).toBe(testImgUrl);
        expect(testImgBg.style.backgroundImage).toBe(`url(${testImgUrl})`);
    };

    const scrollAndNoLoad = async () => {
        defineGetter(testImgSrc, 'offsetTop', 1000);
        defineGetter(testImgBg, 'offsetTop', 1000);

        lazyLoadSrc.bindLazyLoad(testImgSrc, {
            imageUrl: testImgUrl
        });
        lazyLoadBg.bindLazyLoad(testImgBg, {
            imageUrl: testImgUrl
        });

        await makeScroll(document.scrollingElement, 'scrollTop', 100);

        expect(testImgSrc.getAttribute('src')).toBe(loadingImageUrl);
        expect(testImgBg.style.backgroundImage).toBe(`url(${loadingImageUrl})`);

        await makeScroll(document.scrollingElement, 'scrollTop', 300);
        await sleep(550);

        expect(testImgSrc.getAttribute('src')).toBe(loadingImageUrl);
        expect(testImgBg.style.backgroundImage).toBe(`url(${loadingImageUrl})`);
    };

    const pageExistImg = async () => {
        const existImg = document.createElement('img');
        existImg.setAttribute('lazy-test-exist', testImgUrl);
        document.body.appendChild(existImg);

        defineGetter(existImg, 'offsetTop', 800);

        lazyLoadFactory({
            lazyAttr: 'lazy-test-exist',
            loadType: 'src',
            loadingPath: loadingImageUrl
        });

        await makeScroll(document.scrollingElement, 'scrollTop', 100);
        expect(existImg.getAttribute('src')).toBeNull();

        await makeScroll(document.scrollingElement, 'scrollTop', 300);
        await sleep(550);

        expect(existImg.getAttribute('src')).toBe(testImgUrl);
    };

    const unBindEvent = async () => {
        defineGetter(testImgSrc, 'offsetTop', 800);

        lazyLoadSrc.bindLazyLoad(testImgSrc, {
            imageUrl: testImgUrl
        });

        await makeScroll(document.scrollingElement, 'scrollTop', 100);
        expect(testImgSrc.getAttribute('src')).toBe(loadingImageUrl);

        lazyLoadSrc.unBindLazyLoad(testImgSrc);

        await makeScroll(document.scrollingElement, 'scrollTop', 300);
        await sleep(550);

        expect(testImgSrc.getAttribute('src')).toBe(loadingImageUrl);
    };

    describe('無原生 IntersectionObserver' , () => {
        test('捲動並觸發加載', async () => {
            useNoInterObserver();
            await scrollAndLoad();
        });

        test('捲動但未觸發加載', async () => {
            useNoInterObserver();
            await scrollAndNoLoad();
        });

        test('頁面上已經存在的img', async () => {
            useNoInterObserver();
            await pageExistImg();

        });

        test('解除綁定', async () => {
            useNoInterObserver();
            await unBindEvent();
        });
    });

    describe('有原生 IntersectionObserver', () => {
        test('捲動並觸發加載', async () => {
            useInterObserver();
            await scrollAndLoad();
        });

        test('捲動但未觸發加載', async () => {
            useInterObserver();
            await scrollAndNoLoad();
        });

        test('頁面上已經存在的img', async () => {
            useInterObserver();
            await pageExistImg();

        });

        test('解除綁定', async () => {
            useInterObserver();
            await unBindEvent();
        });
    });

});
