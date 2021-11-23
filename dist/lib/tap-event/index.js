'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

exports.bindTap = bindTap;
exports.unbindTap = unbindTap;
//# sourceMappingURL=index.js.map
