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

export { debounce, throttle, toAsync };
//# sourceMappingURL=factory-util.mjs.map
