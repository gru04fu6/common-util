import fs from 'fs';
import path from 'path';
import Rollup from 'rollup';

import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';

interface NodeModuleWithCompile extends NodeModule {
    _compile(code: string, filename: string): any
}

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
            commonjs(),
            typescript()
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

async function loadConfigFromBundledFile<T>(
    fileName: string,
    bundledCode: string
): Promise<T> {
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

function isFunction<T>(fnOrObj: (() => T) | T): fnOrObj is () => T {
    return typeof fnOrObj === 'function';
}

export async function resolveConfig<T>(inlineConfig: T, configName: string, configRoot: string = process.cwd()) {
    const loadResult = await loadConfigFromFile<T>(configName, configRoot);

    const config = Object.assign(inlineConfig, loadResult);

    return config;
}

export async function loadConfigFromFile<T>(
    configName: string,
    configRoot: string = process.cwd()
): Promise<T | null> {
    const start = Date.now();

    let resolvedPath: string | undefined;
    let isTS = false;

    const jsconfigFile = path.resolve(configRoot, `${configName}.js`);
    if (fs.existsSync(jsconfigFile)) {
        resolvedPath = jsconfigFile;
    }

    if (!resolvedPath) {
        const tsconfigFile = path.resolve(configRoot, `${configName}.ts`);
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
        let userConfig: (() => T) | T | undefined;

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

        const config = isFunction(userConfig) ? userConfig() : userConfig;
        if (!(config instanceof Object)) {
            throw new Error('config must export or return an object.');
        }
        return config;
    } catch (e) {
        debug(`failed to load config from ${resolvedPath}`);
        throw e;
    }
}