'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var factoryUtil = require('../utils/factory-util.js');
var domUtil = require('../utils/dom-util.js');

function lazyLoadFactory(params) {
  const attr = params.lazyAttr || "lazy";
  const type = params.loadType || "src";
  const loadingPath = params.loadingPath || "";
  const handlerMap = new Map();
  let observer;
  function loadImage(el) {
    const cache = el.src;
    el.src = el.getAttribute(attr) || "";
    el.onerror = function() {
      el.src = params.errorPath || cache;
      el.onerror = null;
    };
  }
  function loadElement(el) {
    switch (type) {
      case "src":
        loadImage(el);
        break;
      case "background":
        el.style.backgroundImage = `url(${el.getAttribute(attr)})`;
        break;
    }
    el.removeAttribute(attr);
  }
  function checkReplaceImage(el) {
    const scrollParent = domUtil.getScrollParent(el);
    if (!scrollParent) {
      return false;
    }
    const bottom = scrollParent.scrollTop + scrollParent.clientHeight;
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
    const handler = factoryUtil.throttle(generateScrollHandler(el), 500);
    handlerMap.set(el, handler);
    window.addEventListener("scroll", handler);
  }
  function removeListener(el) {
    if (handlerMap.has(el)) {
      window.removeEventListener("scroll", handlerMap.get(el));
      handlerMap.delete(el);
    }
  }
  function update() {
    const els = document.querySelectorAll(`[${attr}]`);
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      if (observer) {
        observer.observe(el);
      } else {
        setListener(el);
      }
    }
  }
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver((entries) => {
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
  function bindLazyLoad(el, binding) {
    if (loadingPath) {
      switch (type) {
        case "src":
          el.src = loadingPath;
          break;
        case "background":
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
  function unBindLazyLoad(el) {
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

exports["default"] = lazyLoadFactory;
//# sourceMappingURL=index.js.map
