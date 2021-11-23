interface Binding {
    /** 行高(px) */
    lineHeight?: string;
    /** 最多幾行 */
    lineCount: string;
}
/**
 * @param clampValueProp
 * 紀錄最多幾行的屬性名稱
 * `default: v-line-clamp-value`
 *
 * @param dotPaddingProp
 * 紀錄縮寫點位移的屬性名稱(不支援webkitLineClamp的瀏覽器才會加上)
 * `default: v-dot-padding`
 */
declare const lineClampFactory: (clampValueProp?: string, dotPaddingProp?: string) => {
    addInitStyle: (el: HTMLElement) => void;
    truncateText: (el: HTMLElement, bindings: Binding) => void;
};
export default lineClampFactory;
