/**
 * 使用者設定
 * @property  {String} mockSrcPath mock檔案的目錄位置
 * @property  {String} generatePath 產生type與mockRoute的位置
 * @property  {String} realApiConfigPath 真實api設定檔的位置
 */
export interface MockApiUserConfig {
    mockSrcPath: string;
    generatePath: string;
    realApiConfigPath: string;
    changeTypeName?: Record<string, string>;
}
export declare type MockApiUserConfigFn = () => MockApiUserConfig;
export declare type MockApiUserConfigExport = MockApiUserConfig | MockApiUserConfigFn;
export declare function defineMockApiConfig(config: MockApiUserConfigExport): MockApiUserConfigExport;
export declare function resolveMockApiConfig(inlineConfig: MockApiUserConfig): Promise<MockApiUserConfig>;
