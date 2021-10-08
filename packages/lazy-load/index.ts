import { throttle } from '@common-util/utils/factory-util';
import { getScrollParent } from '@common-util/utils/dom-util';

interface Binding {
    /** 圖片網址 */
    imageUrl: string;
}

/**
 * 懶加載
 *
 * @param params
 * @param params.lazyAttr
 * 暫存圖片網址的屬性名稱
 * `default: lazy`
 *
 * @param params.loadType
 * 載入圖片的方式 'src' | 'background'
 * `default: src`
 *
 * @param params.errorPath
 * 加載失敗的圖片
 *
 * @param params.loadingPath
 * 加載中的圖片
 */
function lazyLoadFactory(params: {
    lazyAttr?: string;
    loadType?: 'src' | 'background';
    errorPath?: string;
    loadingPath?: string;
}) {
    const attr = params.lazyAttr || 'lazy';
    const type = params.loadType || 'src';
    const loadingPath = params.loadingPath || '';
    const handlerMap: Map<HTMLElement, (e: Event) => void> = new Map();
    /**
     * 监听器
     * [MDN说明](https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver)
    */
    let observer: IntersectionObserver | undefined;

    /**
     * img載入圖片
     */
    function loadImage(el: HTMLImageElement) {
        const cache = el.src;
        el.src = el.getAttribute(attr) || '';
        el.onerror = function () {
            el.src = params.errorPath || cache;
            el.onerror = null;
        };
    }

    /**
     * 觸發加載時替換圖片
     */
    function loadElement(el: HTMLElement) {
        switch (type) {
            case 'src':
                loadImage(el as HTMLImageElement);
                break;
            case 'background':
                el.style.backgroundImage = `url(${el.getAttribute(attr)})`;
                break;
        }
        el.removeAttribute(attr);
    }

    /**
     * 檢查是否需要替換圖片
     */
    function checkReplaceImage(el: HTMLElement): boolean {
        const scrollParent = getScrollParent(el);
        const bottom = scrollParent.scrollTop + scrollParent.clientHeight;

        return bottom > el.offsetTop;
    }

    function generateScrollHandler(el: HTMLElement) {
        return () => {
            if (checkReplaceImage(el)) {
                loadElement(el);
                removeListener(el);
            }
        };
    }

    function setListener(el: HTMLElement) {
        const handler = throttle(generateScrollHandler(el), 500);
        handlerMap.set(el, handler);
        window.addEventListener('scroll', handler);
    }

    function removeListener(el: HTMLElement) {
        if (handlerMap.has(el)) {
            window.removeEventListener('scroll', handlerMap.get(el)!);
            handlerMap.delete(el);
        }
    }

    /** 爲整個頁面上有設置懶加載屬性的元素加上監聽 */
    function update() {
        const els = document.querySelectorAll(`[${attr}]`);

        for (let i = 0; i < els.length; i++) {
            const el = els[i] as HTMLElement;
            if (observer) {
                observer.observe(el);
            } else {
                setListener(el);
            }
        }
    }

    if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(entries => {
            for (let i = 0; i < entries.length; i++) {
                const item = entries[i];
                if (item.isIntersecting) {
                    const el = item.target as HTMLElement;
                    loadElement(el);
                    observer!.unobserve(el);
                }
            }
        });
    }

    /** 綁定監聽懶加載事件 */
    function bindLazyLoad(el: HTMLElement, binding: Binding) {
        if (loadingPath) {
            switch (type) {
                case 'src':
                    (el as HTMLImageElement).src = loadingPath;
                    break;
                case 'background':
                    el.style.backgroundImage = `url(${loadingPath})`;
                    break;
            }
        }

        el.setAttribute(attr, binding.imageUrl);

        if (observer) {
            observer.observe(el);
        } else if (checkReplaceImage(el)) {
            loadElement(el);
        } else {
            setListener(el);
        }
    }

    /** 解除綁定監聽懶加載事件 */
    function unBindLazyLoad(el: HTMLElement) {
        if (observer) {
            observer.unobserve(el);
        } else {
            removeListener(el);
        }
    }

    update();

    return {
        bindLazyLoad,
        unBindLazyLoad
    };
}

export default lazyLoadFactory;