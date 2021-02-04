import fs from 'fs';
import path from 'path';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const { nodeResolve } = require('@rollup/plugin-node-resolve');
function debug(...str) {
}
function bundleConfigFile(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const rollup = require('rollup');
        // node-resolve must be imported since it's bundled
        const bundle = yield rollup.rollup({
            plugins: [
                nodeResolve()
            ],
            external: (id) => (id[0] !== '.' && !path.isAbsolute(id)) ||
                id.slice(-5, id.length) === '.json',
            input: fileName,
            treeshake: false
        });
        const { output: [{ code }] } = yield bundle.generate({
            exports: 'named',
            format: 'cjs'
        });
        return code;
    });
}
function loadConfigFromBundledFile(fileName, bundledCode) {
    return __awaiter(this, void 0, void 0, function* () {
        const extension = path.extname(fileName);
        const defaultLoader = require.extensions[extension];
        require.extensions[extension] = (module, filename) => {
            if (filename === fileName) {
                module._compile(bundledCode, filename);
            }
            else {
                defaultLoader(module, filename);
            }
        };
        // clear cache in case of server restart
        delete require.cache[require.resolve(fileName)];
        const raw = require(fileName);
        const config = raw.__esModule ? raw.default : raw;
        require.extensions[extension] = defaultLoader;
        return config;
    });
}
function defineConfig(config) {
    return config;
}
function resolveConfig(inlineConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const loadResult = yield loadConfigFromFile();
        const config = Object.assign(inlineConfig, loadResult);
        return config;
    });
}
function loadConfigFromFile(configRoot = process.cwd()) {
    return __awaiter(this, void 0, void 0, function* () {
        const start = Date.now();
        let resolvedPath;
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
            return null;
        }
        try {
            let userConfig;
            if (isTS) {
                const code = yield bundleConfigFile(resolvedPath);
                userConfig = yield loadConfigFromBundledFile(resolvedPath, code);
                debug(`bundled config file loaded in ${Date.now() - start}ms`);
            }
            else {
                try {
                    // clear cache in case of server restart
                    delete require.cache[require.resolve(resolvedPath)];
                    userConfig = require(resolvedPath);
                    debug(`cjs config loaded in ${Date.now() - start}ms`);
                }
                catch (e) {
                    const ignored = new RegExp([
                        'Cannot use import statement',
                        'Unexpected token \'export\'',
                        'Must use import to load ES Module',
                        'Unexpected identifier' // #1635 Node <= 12.4 has no esm detection
                    ].join('|'));
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
        }
        catch (e) {
            throw e;
        }
    });
}

function registerRouterFactory(router) {
    /**
     * 呼叫 API 方法
     * @param  {String} method 請求方式
     * @param  {String} path API 路徑
     * @param  {Object} json 回傳的 json 物件
     * @param  {Number} time 模擬回傳的時間
     */
    const registerRouter = ({ method = 'get', path, reqHandler, time = 800 }) => {
        const func = (req, res) => {
            console.log(req.url);
            setTimeout(() => {
                res.json(reqHandler.bind({}, req)());
            }, time);
        };
        router[method](path, func);
    };
    return registerRouter;
}

const express = require('express');
const bodyParser = require('body-parser');
function cli() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = yield resolveConfig({
            port: 3000
        });
        const MockServer = express();
        MockServer.set('port', config.port);
        MockServer.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS');
            next();
        });
        MockServer.use(bodyParser.urlencoded({
            extended: true,
            parameterLimit: 10000,
            limit: 1024 * 1024 * 10
        }));
        MockServer.use(bodyParser.json());
        if (config.settingServer) {
            config.settingServer(MockServer);
        }
        const routes = express.Router();
        if (config.registerRouter) {
            config.registerRouter(registerRouterFactory(routes));
        }
        else {
            routes.get('/example', (req, res) => setTimeout(() => res.json({ data: 'example data' }), 200));
        }
        MockServer.use('/', routes);
        MockServer.listen(MockServer.get('port'), () => {
            console.log(`Mock server is running at http://localhost:${MockServer.get('port')}`);
        });
    });
}

export { cli, defineConfig, loadConfigFromFile, resolveConfig };
