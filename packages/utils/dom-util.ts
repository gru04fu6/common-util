export function getScrollParent(node: HTMLElement): HTMLElement {
    const isElement = node instanceof HTMLElement;
    const overflowY = isElement && window.getComputedStyle(node).overflowY;
    const isScrollable = overflowY === 'auto' || overflowY === 'scroll';

    if (!node) {
        return null;
    } else if (isScrollable && node.scrollHeight >= node.clientHeight) {
        return node;
    }

    return getScrollParent(node.parentNode as HTMLElement) || document.scrollingElement as HTMLElement;
}
