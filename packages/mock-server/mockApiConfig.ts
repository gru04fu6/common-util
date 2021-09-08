
import { resolveConfig as _resolveConfig } from  './loadConfig';

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
export type MockApiUserConfigFn = () => MockApiUserConfig;
export type MockApiUserConfigExport = MockApiUserConfig | MockApiUserConfigFn;

export function defineMockApiConfig(config: MockApiUserConfigExport): MockApiUserConfigExport {
    return config;
}

export function resolveMockApiConfig(inlineConfig: MockApiUserConfig) {
    return _resolveConfig(inlineConfig, 'mock-api.config');
}