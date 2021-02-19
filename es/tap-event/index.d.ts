export declare type TapHandler = (event: MouseEvent | TouchEvent) => void;
export interface HackEl extends HTMLElement {
    _tapEventMap?: Map<TapHandler, {
        click?: TapHandler;
        touchStart?: TapHandler;
        touchEnd?: TapHandler;
    }>;
}
export interface Modifiers {
    stop?: boolean;
    prevent?: boolean;
    self?: boolean;
    once?: boolean;
}
export declare function bindTap(el: HTMLElement, cb: TapHandler, modifiers?: Modifiers): void;
export declare function unbindTap(el: HTMLElement, cb: TapHandler): void;
