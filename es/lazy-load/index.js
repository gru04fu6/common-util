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
function lazyLoadFactory(params) {
    const attr = params.lazyAttr || 'lazy';
    const type = params.loadType || 'src';
    const loadingPath = params.loadingPath || '';
    const handlerMap = new Map();
    /**
     * 监听器
     * [MDN说明](https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver)
    */
    let observer;
    function throttle(fn, delay) {
        let timer;
        let prevTime;
        return function (...args) {
            const currTime = Date.now();
            const context = this;
            if (!prevTime)
                prevTime = currTime;
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
     * img載入圖片
     */
    function loadImage(el) {
        const cache = el.src;
        el.src = el.getAttribute(attr) || '';
        el.onerror = function () {
            el.src = params.errorPath || cache;
        };
    }
    /**
     * 觸發加載時替換圖片
     */
    function loadElement(el) {
        switch (type) {
            case 'src':
                loadImage(el);
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
    function checkReplaceImage(el) {
        const bottom = window.scrollY + window.innerHeight;
        return bottom > el.offsetTop;
    }
    function generateScrollHandler(el) {
        return () => {
            if (checkReplaceImage(el)) {
                loadElement(el);
                removeListener(el);
            }
        };
    }
    function setListener(el) {
        const handler = throttle(generateScrollHandler(el), 500);
        handlerMap.set(el, handler);
        window.addEventListener('scroll', handler);
    }
    function removeListener(el) {
        if (handlerMap.has(el)) {
            window.removeEventListener('scroll', handlerMap.get(el));
            handlerMap.delete(el);
        }
    }
    /** 爲整個頁面上有設置懶加載屬性的元素加上監聽 */
    function update() {
        const els = document.querySelectorAll(`[${attr}]`);
        for (let i = 0; i < els.length; i++) {
            const el = els[i];
            if (observer) {
                observer.observe(el);
            }
            else {
                setListener(el);
            }
        }
    }
    if (IntersectionObserver) {
        observer = new IntersectionObserver(entries => {
            for (let i = 0; i < entries.length; i++) {
                const item = entries[i];
                if (item.isIntersecting) {
                    const el = item.target;
                    loadElement(el);
                    observer.unobserve(el);
                }
            }
        });
    }
    /** 綁定監聽懶加載事件 */
    function bindLazyLoad(el, binding) {
        switch (type) {
            case 'src':
                el.src = loadingPath;
                break;
            case 'background':
                el.style.backgroundImage = `url(${loadingPath})`;
                break;
        }
        el.setAttribute(attr, binding.imageUrl);
        if (observer) {
            observer.observe(el);
        }
        else if (checkReplaceImage(el)) {
            loadElement(el);
        }
        else {
            setListener(el);
        }
    }
    /** 解除綁定監聽懶加載事件 */
    function unBindLazyLoad(el) {
        if (observer) {
            observer.unobserve(el);
        }
        else {
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
