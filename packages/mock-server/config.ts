import fs from 'fs';
import path from 'path';
import Rollup from 'rollup';

const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescript = require('rollup-plugin-typescript2');

import type { Express } from 'express';

interface NodeModuleWithCompile extends NodeModule {
    _compile(code: string, filename: string): any
}

export type RegisterRouterFunction = (param: {
    method?: 'get' | 'delete' | 'put' | 'post';
    path: string;
    reqHandler: (req: any) => any;
    time?: number
}) => void;

export interface UserConfig {
    port: number;
    settingServer?: (server: Express) => void;
    registerRouter?: (register: RegisterRouterFunction) => void;
}
export type UserConfigFn = () => UserConfig;
export type UserConfigExport = UserConfig | UserConfigFn;

const debugMode = false;
function debug(...str: string[]) {
    if (debugMode) {
        console.log(...str);
    }
}

async function bundleConfigFile(
    fileName: string
): Promise<string> {
    const rollup = require('rollup') as typeof Rollup;
    // node-resolve must be imported since it's bundled
    const bundle = await rollup.rollup({
        plugins: [
            nodeResolve(),
            typescript({
                tsconfigOverride: {
                    compilerOptions: {
                        declaration: false
                    }
                },
                abortOnError: false
            })
        ],
        external: (id: string) =>
            (id[0] !== '.' && !path.isAbsolute(id)) ||
        id.slice(-5, id.length) === '.json',
        input: fileName,
        treeshake: false
    });

    const {
        output: [{ code }]
    } = await bundle.generate({
        exports: 'named',
        format: 'cjs'
    });

    return code;
}

async function loadConfigFromBundledFile(
    fileName: string,
    bundledCode: string
): Promise<UserConfig> {
    const extension = path.extname(fileName);
    const defaultLoader = require.extensions[extension]!;
    require.extensions[extension] = (module: NodeModule, filename: string) => {
        if (filename === fileName) {
            (module as NodeModuleWithCompile)._compile(bundledCode, filename);
        } else {
            defaultLoader(module, filename);
        }
    };
    // clear cache in case of server restart
    delete require.cache[require.resolve(fileName)];
    const raw = require(fileName);
    const config = raw.__esModule ? raw.default : raw;
    require.extensions[extension] = defaultLoader;
    return config;
}

export function defineConfig(config: UserConfigExport): UserConfigExport {
    return config;
}

export async function resolveConfig(inlineConfig: UserConfig) {
    const loadResult = await loadConfigFromFile();

    const config = Object.assign(inlineConfig, loadResult);

    return config;
}

export async function loadConfigFromFile(
    configRoot: string = process.cwd()
): Promise<UserConfig | null> {
    const start = Date.now();

    let resolvedPath: string | undefined;
    let isTS = false;

    const jsconfigFile = path.resolve(configRoot, 'mock-server.config.js');
    if (fs.existsSync(jsconfigFile)) {
        resolvedPath = jsconfigFile;
    }

    if (!resolvedPath) {
        const tsconfigFile = path.resolve(configRoot, 'mock-server.config.ts');
        if (fs.existsSync(tsconfigFile)) {
            resolvedPath = tsconfigFile;
            isTS = true;
        }
    }

    if (!resolvedPath) {
        debug('no config file found.');
        return null;
    }

    try {
        let userConfig: UserConfigExport | undefined;

        if (isTS) {
            const code = await bundleConfigFile(resolvedPath);
            userConfig = await loadConfigFromBundledFile(resolvedPath, code);
            debug(`bundled config file loaded in ${Date.now() - start}ms`);
        } else {
            try {
                // clear cache in case of server restart
                delete require.cache[require.resolve(resolvedPath)];
                userConfig = require(resolvedPath);
                debug(`cjs config loaded in ${Date.now() - start}ms`);
            } catch (e) {
                const ignored = new RegExp(
                    [
                        'Cannot use import statement',
                        'Unexpected token \'export\'',
                        'Must use import to load ES Module',
                        'Unexpected identifier' // #1635 Node <= 12.4 has no esm detection
                    ].join('|')
                );
                if (!ignored.test(e.message)) {
                    throw e;
                }
            }
        }

        const config = typeof userConfig === 'function' ? userConfig() : userConfig;
        if (!(config instanceof Object)) {
            throw new Error('config must export or return an object.');
        }
        return config;
    } catch (e) {
        debug(`failed to load config from ${resolvedPath}`);
        throw e;
    }
}