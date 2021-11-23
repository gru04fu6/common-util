(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.CommonUtil = {}));
})(this, (function (exports) { 'use strict';

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

    function throttle(fn, delay) {
      let timer;
      let prevTime;
      return function(...args) {
        const currTime = Date.now();
        const context = this;
        if (prevTime && currTime < prevTime + delay) {
          if (!timer) {
            timer = window.setTimeout(function() {
              prevTime = Date.now();
              timer = 0;
              fn.apply(context, args);
            }, prevTime + delay - currTime);
          }
          return;
        }
        prevTime = currTime;
        fn.apply(context, args);
      };
    }
    function debounce(fn, wait) {
      const context = this;
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = window.setTimeout(function() {
          timeout = void 0;
          fn.apply(context, args);
        }, wait);
      };
    }
    function toAsync(promiseObject) {
      return new Promise((resolve) => {
        promiseObject.then((res) => {
          resolve({
            status: true,
            response: res
          });
        }).catch((e) => {
          resolve({
            status: false,
            error: e
          });
        });
      });
    }

    var factoryUtil = /*#__PURE__*/Object.freeze({
        __proto__: null,
        throttle: throttle,
        debounce: debounce,
        toAsync: toAsync
    });

    function getScrollParent(node) {
      const isElement = node instanceof HTMLElement;
      const overflowY = isElement && window.getComputedStyle(node).overflowY;
      const isScrollable = overflowY === "auto" || overflowY === "scroll";
      if (!node) {
        return null;
      } else if (isScrollable && node.scrollHeight >= node.clientHeight) {
        return node;
      }
      return getScrollParent(node.parentNode) || document.scrollingElement;
    }

    var domUtil = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getScrollParent: getScrollParent
    });

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
        const scrollParent = getScrollParent(el);
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
        const handler = throttle(generateScrollHandler(el), 500);
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

    function checkTouchEvent(event) {
      return "touches" in event;
    }
    function createTouchEvent(modifiers, cb) {
      let startX = 0;
      let startY = 0;
      let startTime = 0;
      let oldTargetEl = null;
      function touchStart(event) {
        const e = checkTouchEvent(event) ? event.touches[0] : event;
        startX = e.clientX;
        startY = e.clientY;
        startTime = Date.now();
        oldTargetEl = event.currentTarget;
        modifiers.stop && event.stopPropagation();
        modifiers.prevent && event.preventDefault();
      }
      function touchEnd(event) {
        const e = checkTouchEvent(event) ? event.changedTouches[0] : event;
        const diffX = e.clientX - startX;
        const diffY = e.clientY - startY;
        const diffTime = Date.now() - startTime;
        const targetEl = event.target;
        modifiers.stop && event.stopPropagation();
        modifiers.prevent && event.preventDefault();
        if (diffTime < 300 && Math.abs(diffX) < 10 && Math.abs(diffY) < 10 && (modifiers.self && oldTargetEl === targetEl && event.currentTarget === targetEl || !modifiers.self)) {
          cb(event);
          if (modifiers.once) {
            unbindTap(targetEl, cb);
          }
        }
      }
      return {
        touchStart,
        touchEnd
      };
    }
    function createClickEvent(modifiers, cb) {
      return function(event) {
        const targetEl = event.target;
        modifiers.stop && event.stopPropagation();
        modifiers.prevent && event.preventDefault();
        cb(event);
        if (modifiers.once) {
          unbindTap(targetEl, cb);
        }
      };
    }
    function bindTap(el, cb, modifiers) {
      const useTouch = "ontouchend" in document;
      const elHack = el;
      if (!elHack._tapEventMap) {
        elHack._tapEventMap = new Map();
      }
      if (useTouch) {
        const { touchStart, touchEnd } = createTouchEvent(modifiers || {}, cb);
        el.addEventListener("touchstart", touchStart);
        el.addEventListener("touchend", touchEnd);
        elHack._tapEventMap.set(cb, { touchStart, touchEnd });
      } else {
        const click = createClickEvent(modifiers || {}, cb);
        el.addEventListener("click", click);
        elHack._tapEventMap.set(cb, { click });
      }
    }
    function unbindTap(el, cb) {
      const elHack = el;
      if (!elHack._tapEventMap)
        return;
      function removeTapEvent(_cb) {
        if (!elHack._tapEventMap)
          return;
        const tapEvent = elHack._tapEventMap.get(_cb);
        if (tapEvent) {
          tapEvent.click && el.removeEventListener("click", tapEvent.click);
          tapEvent.touchStart && el.removeEventListener("touchstart", tapEvent.touchStart);
          tapEvent.touchEnd && el.removeEventListener("touchend", tapEvent.touchEnd);
          elHack._tapEventMap.delete(_cb);
        }
      }
      if (cb) {
        removeTapEvent(cb);
        return;
      }
      for (const _cb of elHack._tapEventMap.keys()) {
        removeTapEvent(_cb);
      }
    }

    var index = /*#__PURE__*/Object.freeze({
        __proto__: null,
        bindTap: bindTap,
        unbindTap: unbindTap
    });

    function formatMoney(num = 0, hasSymbol = false) {
      if (Number.isNaN(+num)) {
        return num;
      }
      const symbol = +num > 0 ? "+" : "";
      const number = `${num}`.split(".");
      return `${hasSymbol ? symbol : ""}${`${number[0]}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}${number[1] ? `.${number[1]}` : ""}`;
    }
    function formatMoneyFixedTwo(value) {
      if (Number.isNaN(+value)) {
        return value;
      }
      const decimal = `${value}`.split(".")[1] || "";
      if (decimal.length < 2) {
        return formatMoney((+value).toFixed(2));
      }
      return formatMoney(value);
    }
    function formatOdds(num) {
      if (typeof num === "string") {
        return num;
      }
      return num.toFixed(2);
    }
    function accMul(arg1, arg2) {
      let pow = 0;
      const arguments1 = arg1.toString();
      const arguments2 = arg2.toString();
      try {
        pow += arguments1.split(".")[1].length;
      } catch (e) {
      }
      try {
        pow += arguments2.split(".")[1].length;
      } catch (e) {
      }
      return Number(arguments1.replace(".", "")) * Number(arguments2.replace(".", "")) / 10 ** pow;
    }
    function accDiv(arg1, arg2) {
      let t1 = 0;
      let t2 = 0;
      try {
        t1 = arg1.toString().split(".")[1].length;
      } catch (e) {
      }
      try {
        t2 = arg2.toString().split(".")[1].length;
      } catch (e) {
      }
      const r1 = Number(arg1.toString().replace(".", ""));
      const r2 = Number(arg2.toString().replace(".", ""));
      return accMul(r1 / r2, 10 ** (t2 - t1));
    }
    function sizeTransToBytes(sizeString = "") {
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      for (const [index, size] of sizes.entries()) {
        if (~sizeString.indexOf(size)) {
          const sizeNumber = +sizeString.replace(size, "");
          return accMul(sizeNumber, 1024 ** index);
        }
      }
      return 0;
    }
    function bytesTranslate(bytes = 0) {
      const bytesLength = `${bytes}`.length;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const sizeBytesLength = [0, 4, 7, 10, 13];
      let sizeIndex = 0;
      while (sizeBytesLength[sizeIndex + 1] !== void 0 && bytesLength >= sizeBytesLength[sizeIndex + 1]) {
        sizeIndex += 1;
      }
      return `${+accDiv(bytes, 1024 ** sizeIndex).toFixed(2)}${sizes[sizeIndex]}`;
    }

    var numberUtil = /*#__PURE__*/Object.freeze({
        __proto__: null,
        formatMoney: formatMoney,
        formatMoneyFixedTwo: formatMoneyFixedTwo,
        formatOdds: formatOdds,
        accMul: accMul,
        accDiv: accDiv,
        sizeTransToBytes: sizeTransToBytes,
        bytesTranslate: bytesTranslate
    });

    function timePreFix(date) {
      if (+date < 10) {
        return `0${date}`;
      }
      return `${date}`;
    }
    function formatFunc(timeObj, format, UTC = false) {
      const year = UTC ? timeObj.getUTCFullYear() : timeObj.getFullYear();
      const month = (UTC ? timeObj.getUTCMonth() : timeObj.getMonth()) + 1;
      const day = UTC ? timeObj.getUTCDate() : timeObj.getDate();
      const hour = UTC ? timeObj.getUTCHours() : timeObj.getHours();
      const minute = UTC ? timeObj.getUTCMinutes() : timeObj.getMinutes();
      const second = UTC ? timeObj.getUTCSeconds() : timeObj.getSeconds();
      return format.replace(/(YYYY|MM|DD|HH|mm|ss)/g, (match) => {
        switch (match) {
          case "YYYY":
            return `${year}`;
          case "MM":
            return timePreFix(month);
          case "DD":
            return timePreFix(day);
          case "HH":
            return timePreFix(hour);
          case "mm":
            return timePreFix(minute);
          case "ss":
            return timePreFix(second);
          default:
            return match;
        }
      });
    }
    function formatTime(timeObj, format = "YYYY-MM-DD HH:mm:ss") {
      return formatFunc(timeObj, format);
    }
    function formatUTCTime(timeObj, format = "YYYY-MM-DD HH:mm:ss") {
      return formatFunc(timeObj, format, true);
    }
    function translateFunction(timeZone, timeString = "", localToZone = false) {
      let transTime = timeString ? new Date(timeString) : new Date();
      let base = localToZone ? 1 : -1;
      if (Number.isNaN(transTime.getTime())) {
        transTime = new Date();
      }
      const GMTTime = transTime.getTime() + transTime.getTimezoneOffset() * 6e4 * base;
      return GMTTime + timeZone * 36e5 * base;
    }
    function localTimeToZone(timeZone, timeString = "") {
      return translateFunction(timeZone, timeString, true);
    }
    function zoneTimeToLocal(timeZone, timeString = "") {
      return translateFunction(timeZone, timeString);
    }
    function checkDate(startDate, endDate) {
      const startTimestamp = Date.parse(startDate.replace(/-/g, "/"));
      const endTimestamp = Date.parse(endDate.replace(/-/g, "/"));
      if (startTimestamp > endTimestamp) {
        return [endDate, startDate];
      }
      return [startDate, endDate];
    }

    var timeUtil = /*#__PURE__*/Object.freeze({
        __proto__: null,
        formatTime: formatTime,
        formatUTCTime: formatUTCTime,
        localTimeToZone: localTimeToZone,
        zoneTimeToLocal: zoneTimeToLocal,
        checkDate: checkDate
    });

    function _isPlaceholder(a) {
      return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;
    }

    /**
     * Optimized internal one-arity curry function.
     *
     * @private
     * @category Function
     * @param {Function} fn The function to curry.
     * @return {Function} The curried function.
     */

    function _curry1(fn) {
      return function f1(a) {
        if (arguments.length === 0 || _isPlaceholder(a)) {
          return f1;
        } else {
          return fn.apply(this, arguments);
        }
      };
    }

    /**
     * Optimized internal two-arity curry function.
     *
     * @private
     * @category Function
     * @param {Function} fn The function to curry.
     * @return {Function} The curried function.
     */

    function _curry2(fn) {
      return function f2(a, b) {
        switch (arguments.length) {
          case 0:
            return f2;

          case 1:
            return _isPlaceholder(a) ? f2 : _curry1(function (_b) {
              return fn(a, _b);
            });

          default:
            return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function (_a) {
              return fn(_a, b);
            }) : _isPlaceholder(b) ? _curry1(function (_b) {
              return fn(a, _b);
            }) : fn(a, b);
        }
      };
    }

    function _has(prop, obj) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    var toString = Object.prototype.toString;

    var _isArguments =
    /*#__PURE__*/
    function () {
      return toString.call(arguments) === '[object Arguments]' ? function _isArguments(x) {
        return toString.call(x) === '[object Arguments]';
      } : function _isArguments(x) {
        return _has('callee', x);
      };
    }();

    var _isArguments$1 = _isArguments;

    var hasEnumBug = !
    /*#__PURE__*/
    {
      toString: null
    }.propertyIsEnumerable('toString');
    var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString']; // Safari bug

    var hasArgsEnumBug =
    /*#__PURE__*/
    function () {

      return arguments.propertyIsEnumerable('length');
    }();

    var contains = function contains(list, item) {
      var idx = 0;

      while (idx < list.length) {
        if (list[idx] === item) {
          return true;
        }

        idx += 1;
      }

      return false;
    };
    /**
     * Returns a list containing the names of all the enumerable own properties of
     * the supplied object.
     * Note that the order of the output array is not guaranteed to be consistent
     * across different JS platforms.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Object
     * @sig {k: v} -> [k]
     * @param {Object} obj The object to extract properties from
     * @return {Array} An array of the object's own properties.
     * @see R.keysIn, R.values
     * @example
     *
     *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
     */


    var keys = typeof Object.keys === 'function' && !hasArgsEnumBug ?
    /*#__PURE__*/
    _curry1(function keys(obj) {
      return Object(obj) !== obj ? [] : Object.keys(obj);
    }) :
    /*#__PURE__*/
    _curry1(function keys(obj) {
      if (Object(obj) !== obj) {
        return [];
      }

      var prop, nIdx;
      var ks = [];

      var checkArgsLength = hasArgsEnumBug && _isArguments$1(obj);

      for (prop in obj) {
        if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
          ks[ks.length] = prop;
        }
      }

      if (hasEnumBug) {
        nIdx = nonEnumerableProps.length - 1;

        while (nIdx >= 0) {
          prop = nonEnumerableProps[nIdx];

          if (_has(prop, obj) && !contains(ks, prop)) {
            ks[ks.length] = prop;
          }

          nIdx -= 1;
        }
      }

      return ks;
    });
    var keys$1 = keys;

    function _cloneRegExp(pattern) {
      return new RegExp(pattern.source, (pattern.global ? 'g' : '') + (pattern.ignoreCase ? 'i' : '') + (pattern.multiline ? 'm' : '') + (pattern.sticky ? 'y' : '') + (pattern.unicode ? 'u' : ''));
    }

    /**
     * Gives a single-word string description of the (native) type of a value,
     * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
     * attempt to distinguish user Object types any further, reporting them all as
     * 'Object'.
     *
     * @func
     * @memberOf R
     * @since v0.8.0
     * @category Type
     * @sig (* -> {*}) -> String
     * @param {*} val The value to test
     * @return {String}
     * @example
     *
     *      R.type({}); //=> "Object"
     *      R.type(1); //=> "Number"
     *      R.type(false); //=> "Boolean"
     *      R.type('s'); //=> "String"
     *      R.type(null); //=> "Null"
     *      R.type([]); //=> "Array"
     *      R.type(/[A-z]/); //=> "RegExp"
     *      R.type(() => {}); //=> "Function"
     *      R.type(undefined); //=> "Undefined"
     */

    var type =
    /*#__PURE__*/
    _curry1(function type(val) {
      return val === null ? 'Null' : val === undefined ? 'Undefined' : Object.prototype.toString.call(val).slice(8, -1);
    });

    var type$1 = type;

    /**
     * Copies an object.
     *
     * @private
     * @param {*} value The value to be copied
     * @param {Array} refFrom Array containing the source references
     * @param {Array} refTo Array containing the copied source references
     * @param {Boolean} deep Whether or not to perform deep cloning.
     * @return {*} The copied value.
     */

    function _clone(value, refFrom, refTo, deep) {
      var copy = function copy(copiedValue) {
        var len = refFrom.length;
        var idx = 0;

        while (idx < len) {
          if (value === refFrom[idx]) {
            return refTo[idx];
          }

          idx += 1;
        }

        refFrom[idx + 1] = value;
        refTo[idx + 1] = copiedValue;

        for (var key in value) {
          copiedValue[key] = deep ? _clone(value[key], refFrom, refTo, true) : value[key];
        }

        return copiedValue;
      };

      switch (type$1(value)) {
        case 'Object':
          return copy({});

        case 'Array':
          return copy([]);

        case 'Date':
          return new Date(value.valueOf());

        case 'RegExp':
          return _cloneRegExp(value);

        default:
          return value;
      }
    }

    /**
     * Creates a deep copy of the value which may contain (nested) `Array`s and
     * `Object`s, `Number`s, `String`s, `Boolean`s and `Date`s. `Function`s are
     * assigned by reference rather than copied
     *
     * Dispatches to a `clone` method if present.
     *
     * @func
     * @memberOf R
     * @since v0.1.0
     * @category Object
     * @sig {*} -> {*}
     * @param {*} value The object or array to clone
     * @return {*} A deeply cloned copy of `val`
     * @example
     *
     *      const objects = [{}, {}, {}];
     *      const objectsClone = R.clone(objects);
     *      objects === objectsClone; //=> false
     *      objects[0] === objectsClone[0]; //=> false
     */

    var clone =
    /*#__PURE__*/
    _curry1(function clone(value) {
      return value != null && typeof value.clone === 'function' ? value.clone() : _clone(value, [], [], true);
    });

    var clone$1 = clone;

    /**
     * Iterate over an input `object`, calling a provided function `fn` for each
     * key and value in the object.
     *
     * `fn` receives three argument: *(value, key, obj)*.
     *
     * @func
     * @memberOf R
     * @since v0.23.0
     * @category Object
     * @sig ((a, String, StrMap a) -> Any) -> StrMap a -> StrMap a
     * @param {Function} fn The function to invoke. Receives three argument, `value`, `key`, `obj`.
     * @param {Object} obj The object to iterate over.
     * @return {Object} The original object.
     * @example
     *
     *      const printKeyConcatValue = (value, key) => console.log(key + ':' + value);
     *      R.forEachObjIndexed(printKeyConcatValue, {x: 1, y: 2}); //=> {x: 1, y: 2}
     *      // logs x:1
     *      // logs y:2
     * @symb R.forEachObjIndexed(f, {x: a, y: b}) = {x: a, y: b}
     */

    var forEachObjIndexed =
    /*#__PURE__*/
    _curry2(function forEachObjIndexed(fn, obj) {
      var keyList = keys$1(obj);
      var idx = 0;

      while (idx < keyList.length) {
        var key = keyList[idx];
        fn(obj[key], key, obj);
        idx += 1;
      }

      return obj;
    });

    var forEachObjIndexed$1 = forEachObjIndexed;

    function setPropertyByPath(target, path, value) {
      if (!path) {
        console.warn("path \u4E0D\u53EF\u70BA\u7A7A\u503C");
        return;
      }
      const pathArray = path.split(".");
      let findTarget = target;
      while (pathArray.length > 1) {
        if (findTarget[pathArray[0]] === void 0) {
          findTarget[pathArray[0]] = {};
        }
        findTarget = findTarget[pathArray.shift()];
        if (!(findTarget instanceof Object)) {
          console.warn(`\u5C6C\u6027 '${pathArray[0]}' \u975E\u7269\u4EF6\u985E\u5225`);
          return;
        }
      }
      findTarget[pathArray[0]] = value;
    }
    function getPropertyByPath(target, path) {
      const pathArray = path.split(".");
      let findTarget = target;
      try {
        while (pathArray.length > 0) {
          findTarget = findTarget[pathArray.shift()];
        }
        return findTarget;
      } catch (e) {
        console.warn("\u5F9E\u7269\u4EF6", target, `\u4E0A\u53D6\u8DEF\u5F91'${path}'\u5931\u6557`);
        return void 0;
      }
    }
    function objHasProperty(obj, prop) {
      return Object.hasOwnProperty.call(obj, prop);
    }
    function dataIsSet(obj) {
      return Object.keys(obj).length > 0;
    }
    function isTwoLayArray(array) {
      for (const subArray of array.values()) {
        if (Array.isArray(subArray)) {
          return true;
        }
      }
      return false;
    }
    function jsonArrayCovert(jsonString) {
      let array = [];
      try {
        array = JSON.parse(jsonString);
      } catch (e) {
        console.warn(`jsonArrayCovert => \`${jsonString}\` fail`);
      }
      return array;
    }
    function zeroValueObject(obj, needClone = true) {
      const newObj = needClone ? clone$1(obj) : obj;
      forEachObjIndexed$1((value, key) => {
        switch (typeof newObj[key]) {
          case "number":
            newObj[key] = 0;
            break;
          case "string":
            newObj[key] = "";
            break;
          case "boolean":
            newObj[key] = false;
            break;
          case "object":
            if (Object.keys(newObj[key]).length) {
              newObj[key] = zeroValueObject(newObj[key], false);
            }
            break;
        }
      }, newObj);
      return newObj;
    }
    function checkZeroObject(obj, excludeKey = {}) {
      let valid = true;
      forEachObjIndexed$1((item, key) => {
        if (objHasProperty(excludeKey, key) && excludeKey[key])
          return;
        if (typeof item === "object") {
          if (!checkZeroObject(item)) {
            valid = false;
          }
        } else if (item) {
          valid = false;
        }
      }, obj);
      return valid;
    }

    var objectUtil = /*#__PURE__*/Object.freeze({
        __proto__: null,
        setPropertyByPath: setPropertyByPath,
        getPropertyByPath: getPropertyByPath,
        objHasProperty: objHasProperty,
        dataIsSet: dataIsSet,
        isTwoLayArray: isTwoLayArray,
        jsonArrayCovert: jsonArrayCovert,
        zeroValueObject: zeroValueObject,
        checkZeroObject: checkZeroObject
    });

    exports.domUtil = domUtil;
    exports.factoryUtil = factoryUtil;
    exports.lazyLoad = lazyLoadFactory;
    exports.lineClamp = lineClampFactory;
    exports.numberUtil = numberUtil;
    exports.objectUtil = objectUtil;
    exports.tapEvent = index;
    exports.timeUtil = timeUtil;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
