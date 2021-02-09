import type { Express } from 'express';
import type { RegisterRouterFunction } from './registerRouter';
/**
 * 使用者設定
 * @property  {Number=} port MockServer的port號 `default: 3000`
 * @property  {String=} watchDir 需要監聽的資料夾 `default: ./mock`
 * @property  {Function=} settingServer 傳入express app實例，可以在此對express做額外設定
 * @property  {Function=} registerRouter 註冊router
 */
export interface UserConfig {
    port?: number;
    watchDir?: string;
    settingServer?: (server: Express) => void;
    registerRouter?: (register: RegisterRouterFunction) => void;
}
export declare type UserConfigFn = () => UserConfig;
export declare type UserConfigExport = UserConfig | UserConfigFn;
export declare function defineConfig(config: UserConfigExport): UserConfigExport;
export declare function resolveConfig(inlineConfig: UserConfig): Promise<UserConfig>;
export declare function loadConfigFromFile(configRoot?: string): Promise<UserConfig | null>;
