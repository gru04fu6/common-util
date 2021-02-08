import type { Express } from 'express';
import type { RegisterRouterFunction } from './registerRouter';
export interface UserConfig {
    port: number;
    settingServer?: (server: Express) => void;
    registerRouter?: (register: RegisterRouterFunction) => void;
}
export declare type UserConfigFn = () => UserConfig;
export declare type UserConfigExport = UserConfig | UserConfigFn;
export declare function defineConfig(config: UserConfigExport): UserConfigExport;
export declare function resolveConfig(inlineConfig: UserConfig): Promise<UserConfig>;
export declare function loadConfigFromFile(configRoot?: string): Promise<UserConfig | null>;
