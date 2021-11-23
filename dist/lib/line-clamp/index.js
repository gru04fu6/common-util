'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const lineClampFactory = (clampValueProp = "v-line-clamp-value", dotPaddingProp = "v-dot-padding") => {
  const addInitStyle = (el) => {
    el.style.cssText += `
            display: block;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            overflow: hidden;
            word-break: break-all;
            text-overflow: ellipsis;
        `;
  };
  const checkDotShow = (el) => {
    const elContentHeight = el.scrollHeight;
    const elWrapHeight = el.getBoundingClientRect().height;
    const dotPadding = parseFloat(el.getAttribute(dotPaddingProp) || "none") || 0;
    if (elContentHeight > elWrapHeight) {
      el.insertAdjacentHTML("afterbegin", `
                <span style="
                    float: right;
                    height: ${dotPadding}px;
                    display: block;
                "></span>
                <span style="
                    float: right;
                    clear: both;
                ">...</span>
            `);
    }
  };
  function defaultFallbackFunc(el, bindings, lines) {
    const computedLineHeight = getComputedStyle(el).lineHeight.replace("px", "");
    let lineHeight = parseFloat(computedLineHeight);
    if (bindings.lineHeight) {
      const argLineHeight = parseInt(bindings.lineHeight || "none");
      if (isNaN(argLineHeight)) {
        console.warn("line-height argument for vue-line-clamp must be a number (of pixels)");
      } else {
        lineHeight = argLineHeight;
        el.style.lineHeight = lineHeight + "px";
      }
    }
    const maxHeight = lineHeight * lines;
    el.style.maxHeight = maxHeight ? maxHeight + "px" : "";
    el.setAttribute(dotPaddingProp, `${maxHeight - lineHeight}`);
    requestAnimationFrame(() => {
      checkDotShow(el);
    });
  }
  const useFallbackFunc = "webkitLineClamp" in document.body.style ? void 0 : defaultFallbackFunc;
  const truncateText = (el, bindings) => {
    const lines = parseInt(bindings.lineCount);
    const bindValue = parseInt(el.getAttribute(clampValueProp) || "none");
    if (isNaN(lines)) {
      console.error("Parameter for vue-line-clamp must be a number");
      return;
    }
    if (lines !== bindValue) {
      el.setAttribute(clampValueProp, `${lines}`);
      if (useFallbackFunc) {
        useFallbackFunc(el, bindings, lines);
      } else {
        el.style.webkitLineClamp = lines ? `${lines}` : "";
      }
      return;
    }
    if (useFallbackFunc) {
      checkDotShow(el);
    }
  };
  return {
    addInitStyle,
    truncateText
  };
};

exports["default"] = lineClampFactory;
//# sourceMappingURL=index.js.map
