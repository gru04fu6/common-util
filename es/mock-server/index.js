import fs from 'fs';
import path from 'path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import express from 'express';
import bodyParser from 'body-parser';
import chokidar from 'chokidar';

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

function debug(...str) {
}
function bundleConfigFile(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const rollup = require('rollup');
        // node-resolve must be imported since it's bundled
        const bundle = yield rollup.rollup({
            plugins: [
                nodeResolve(),
                commonjs(),
                typescript()
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
        router[method](path, (req, res) => {
            console.log(req.url);
            setTimeout(() => {
                res.json(reqHandler.bind({}, req)());
            }, time);
        });
    };
    return registerRouter;
}

let server;
let lock = false;
function loadConfig() {
    return resolveConfig({
        port: 3000
    });
}
function startWatch(watchFolder = './mock') {
    const configRoot = process.cwd();
    let rootFolder = path.resolve(configRoot, watchFolder);
    const watcher = chokidar.watch([
        path.resolve(configRoot, 'mock-server.config.js'),
        path.resolve(configRoot, 'mock-server.config.ts'),
        rootFolder
    ], {
        persistent: true,
        ignoreInitial: true
    });
    console.log(`watch file on folder: ${rootFolder}`);
    watcher.on('ready', function () {
        watcher.on('all', function () {
            if (!lock) {
                console.log('restart mock server');
                lock = true;
                server.close(() => __awaiter(this, void 0, void 0, function* () {
                    const config = yield loadConfig();
                    yield startApp(config);
                    lock = false;
                }));
            }
        });
    });
}
function startApp(config) {
    return new Promise(resolve => {
        const MockServer = express();
        MockServer.set('port', config.port);
        MockServer.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS');
            res.set('Connection', 'close');
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
            routes.get('/example', (req, res, next) => setTimeout(() => {
                res.json({ data: 'example data' });
                next();
            }, 200));
        }
        MockServer.use('/', function (req, res, next) {
            routes(req, res, next);
        });
        server = MockServer.listen(config.port, () => {
            console.log(`Mock server is running at http://localhost:${config.port}`);
            resolve();
        });
    });
}
function cli() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = yield loadConfig();
        yield startApp(config);
        startWatch(config.watchDir);
    });
}

export { cli, defineConfig, loadConfigFromFile, resolveConfig };
