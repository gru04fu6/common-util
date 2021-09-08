import type { Express } from 'express';
import type { RegisterRouterFunction } from './registerRouter';
/**
 * 使用者設定
 * @property  {Number=} port MockServer的port號 `default: 3000`
 * @property  {String=} watchDir 需要監聽的資料夾 `default: ./mock`
 * @property  {Function=} settingServer 傳入express app實例，可以在此對express做額外設定
 * @property  {Function=} registerRouter 註冊router
 */
export interface MockServerUserConfig {
    port?: number;
    watchDir?: string;
    settingServer?: (server: Express) => void;
    registerRouter?: (register: RegisterRouterFunction) => void;
}
export declare type MockServerUserConfigFn = () => MockServerUserConfig;
export declare type MockServerUserConfigExport = MockServerUserConfig | MockServerUserConfigFn;
export declare function defineMockServerConfig(config: MockServerUserConfigExport): MockServerUserConfigExport;
export declare function resolveMockServerConfig(inlineConfig: MockServerUserConfig): Promise<MockServerUserConfig>;
