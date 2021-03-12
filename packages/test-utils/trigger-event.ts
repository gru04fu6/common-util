/**
 * Trigger event
 * mouseenter, mouseleave, mouseover, keyup, change, click
 * @param  {Element} elm
 * @param  {String} name
 * @param  {*} opts
 */
const triggerEvent = (elm, name, ...opts) => {
    let eventName;

    if (/^mouse|click/.test(name)) {
        eventName = 'MouseEvents';
    } else if (/^key/.test(name)) {
        eventName = 'KeyboardEvent';
    } else if (/^touch/.test(name)) {
        eventName = 'TouchEvent';
    } else {
        eventName = 'HTMLEvents';
    }
    const evt = document.createEvent(eventName);

    evt.initEvent(name, ...opts);

    Object.defineProperties(evt, {
        stopPropagation: {
            value: jest.fn()
        },
        preventDefault: {
            value: jest.fn()
        }
    });

    if (name === 'keydown' && opts[0]) {
        Object.defineProperty(evt, 'code', { value: opts[0] });
    }
    if (eventName === 'TouchEvent' && opts[0]) {
        Object.keys(opts[0]).forEach(key => {
            Object.defineProperty(evt, key, { value: opts[0][key] });
        });
    }
    elm.dispatchEvent
        ? elm.dispatchEvent(evt)
        : elm.fireEvent('on' + name, evt);

    return evt;
};
export default triggerEvent;
