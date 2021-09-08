export declare function resolveConfig<T>(inlineConfig: T, configName: string, configRoot?: string): Promise<T>;
export declare function loadConfigFromFile<T>(configName: string, configRoot?: string): Promise<T | null>;
