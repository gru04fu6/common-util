import type { Express } from 'express';
export declare type RegisterRouterFunction = (param: {
    method?: 'get' | 'delete' | 'put' | 'post';
    path: string;
    reqHandler: (req: any) => any;
    time?: number;
}) => void;
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
