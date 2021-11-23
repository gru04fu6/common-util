interface Binding {
    /** 圖片網址 */
    imageUrl: string;
}
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
declare function lazyLoadFactory(params: {
    lazyAttr?: string;
    loadType?: 'src' | 'background';
    errorPath?: string;
    loadingPath?: string;
}): {
    bindLazyLoad: (el: HTMLElement, binding: Binding) => void;
    unBindLazyLoad: (el: HTMLElement) => void;
};
export default lazyLoadFactory;
