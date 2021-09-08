'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var path = require('path');
var pluginNodeResolve = require('@rollup/plugin-node-resolve');
var typescript = require('rollup-plugin-typescript2');
var commonjs = require('@rollup/plugin-commonjs');
var express = require('express');
var bodyParser = require('body-parser');
var chokidar = require('chokidar');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var typescript__default = /*#__PURE__*/_interopDefaultLegacy(typescript);
var commonjs__default = /*#__PURE__*/_interopDefaultLegacy(commonjs);
var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var bodyParser__default = /*#__PURE__*/_interopDefaultLegacy(bodyParser);
var chokidar__default = /*#__PURE__*/_interopDefaultLegacy(chokidar);

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
                pluginNodeResolve.nodeResolve(),
                commonjs__default['default'](),
                typescript__default['default']()
            ],
            external: (id) => (id[0] !== '.' && !path__default['default'].isAbsolute(id)) ||
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
        const extension = path__default['default'].extname(fileName);
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
function isFunction(fnOrObj) {
    return typeof fnOrObj === 'function';
}
function resolveConfig(inlineConfig, configName, configRoot = process.cwd()) {
    return __awaiter(this, void 0, void 0, function* () {
        const loadResult = yield loadConfigFromFile(configName, configRoot);
        const config = Object.assign(inlineConfig, loadResult);
        return config;
    });
}
function loadConfigFromFile(configName, configRoot = process.cwd()) {
    return __awaiter(this, void 0, void 0, function* () {
        const start = Date.now();
        let resolvedPath;
        let isTS = false;
        const jsconfigFile = path__default['default'].resolve(configRoot, `${configName}.js`);
        if (fs__default['default'].existsSync(jsconfigFile)) {
            resolvedPath = jsconfigFile;
        }
        if (!resolvedPath) {
            const tsconfigFile = path__default['default'].resolve(configRoot, `${configName}.ts`);
            if (fs__default['default'].existsSync(tsconfigFile)) {
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
            const config = isFunction(userConfig) ? userConfig() : userConfig;
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

function defineMockServerConfig(config) {
    return config;
}
function resolveMockServerConfig$1(inlineConfig) {
    return resolveConfig(inlineConfig, 'mock-server.config');
}

function defineMockApiConfig(config) {
    return config;
}
function resolveMockApiConfig(inlineConfig) {
    return resolveConfig(inlineConfig, 'mock-api.config');
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

function resolveMockServerConfig(inlineConfig) {
    return resolveConfig(inlineConfig, 'mock-server.config');
}

let server;
let lock = false;
function loadConfig$1() {
    return resolveMockServerConfig({
        port: 3000
    });
}
function startWatch(watchFolder = './mock') {
    const configRoot = process.cwd();
    let rootFolder = path__default['default'].resolve(configRoot, watchFolder);
    const watcher = chokidar__default['default'].watch([
        path__default['default'].resolve(configRoot, 'mock-server.config.js'),
        path__default['default'].resolve(configRoot, 'mock-server.config.ts'),
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
                    const config = yield loadConfig$1();
                    yield startApp(config);
                    lock = false;
                }));
            }
        });
    });
}
function startApp(config) {
    return new Promise(resolve => {
        const MockServer = express__default['default']();
        MockServer.set('port', config.port);
        MockServer.use((_, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS');
            res.set('Connection', 'close');
            next();
        });
        MockServer.use(bodyParser__default['default'].urlencoded({
            extended: true,
            parameterLimit: 10000,
            limit: 1024 * 1024 * 10
        }));
        MockServer.use(bodyParser__default['default'].json());
        if (config.settingServer) {
            config.settingServer(MockServer);
        }
        const routes = express__default['default'].Router();
        if (config.registerRouter) {
            config.registerRouter(registerRouterFactory(routes));
        }
        else {
            routes.get('/example', (_, res, next) => setTimeout(() => {
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
// eslint-disable-next-line import/prefer-default-export
function cli() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = yield loadConfig$1();
        yield startApp(config);
        startWatch(config.watchDir);
    });
}

const walk = (dir, done) => {
    let results = [];
    fs__default['default'].readdir(dir, (err, list) => {
        if (err)
            return done(err);
        let pending = list.length;
        if (!pending)
            return done(null, results);
        list.forEach(_file => {
            const file = path__default['default'].resolve(dir, _file);
            fs__default['default'].stat(file, (_, stat) => {
                if (stat && stat.isDirectory()) {
                    walk(file, (__, res) => {
                        results = results.concat(res);
                        pending -= 1;
                        if (!pending)
                            done(null, results);
                    });
                }
                else {
                    results.push(file);
                    pending -= 1;
                    if (!pending)
                        done(null, results);
                }
            });
        });
        return null;
    });
};
function toCamelCase(str) {
    return str
        .replace(/[-/]/g, ' ')
        .replace(/\s(.)/g, $1 => $1.toUpperCase())
        .replace(/_(.)/g, $1 => $1.toUpperCase())
        .replace(/\s/g, '');
}
function toUpperCamelCase(str) {
    return toCamelCase(str)
        .replace(/^(.)/, $1 => $1.toUpperCase());
}
function toLowerCamelCase(str) {
    return toCamelCase(str)
        .replace(/^(.)/, $1 => $1.toLowerCase());
}
const warningText = `// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
//                           這個檔案是自動產生的，不要修改它
// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------\n`;
function loadConfig() {
    return resolveMockApiConfig({
        mockSrcPath: '',
        generatePath: '',
        realApiConfigPath: '',
        changeTypeName: {}
    });
}
// eslint-disable-next-line import/prefer-default-export
function generateMock() {
    return __awaiter(this, void 0, void 0, function* () {
        const mockApiConfig = yield loadConfig();
        const { mockSrcPath, generatePath, realApiConfigPath } = mockApiConfig;
        walk(mockSrcPath, (err, results) => {
            if (err)
                throw err;
            let typeText = warningText;
            let mockText = warningText;
            let mockImportText = '';
            let mockRouteText = '';
            let apiConfig = fs__default['default'].readFileSync(realApiConfigPath, 'utf-8');
            results.sort((a, b) => {
                if (a < b)
                    return -1;
                if (a > b)
                    return 1;
                return 0;
            });
            results.forEach(p => {
                const filePath = p.replace(/\.ts$/, '');
                const apiPath = path__default['default'].relative(mockSrcPath, filePath);
                const registerApiPath = `/${apiPath}`;
                const formatName = mockApiConfig.changeTypeName[registerApiPath] ? mockApiConfig.changeTypeName[registerApiPath] : apiPath.replace(/api\//, '');
                const typePath = path__default['default'].relative(generatePath, filePath);
                const typeName = toUpperCamelCase(formatName);
                typeText += `export * as ${typeName} from '${typePath}';\n`;
                const mockPath = path__default['default'].relative(generatePath, filePath);
                const mockName = toLowerCamelCase(formatName);
                mockImportText += `import ${mockName} from '${mockPath}';\n`;
                const registerMethod = [];
                let tempApiConfig = apiConfig;
                let apiRegexp = new RegExp(`'${registerApiPath}'`, 'g');
                let methodRegexp = new RegExp('method:.*?\'(.*?)\'', 'g');
                while (apiRegexp.exec(tempApiConfig)) {
                    tempApiConfig = tempApiConfig.slice(apiRegexp.lastIndex);
                    if (methodRegexp.exec(tempApiConfig)) {
                        registerMethod.push(RegExp.$1);
                    }
                    methodRegexp.exec('');
                    apiRegexp.exec('');
                }
                if (!registerMethod.length) {
                    registerMethod.push('get');
                }
                registerMethod.forEach(method => {
                    const handlerName = registerMethod.length > 1 ? `${mockName}.${method}Handler` : mockName;
                    const methodText = method === 'get' ? '' : `, method: '${method}' as const`;
                    mockRouteText += `    { path: '${registerApiPath}', reqHandler: ${handlerName}${methodText} },\n`;
                });
            });
            mockRouteText = mockRouteText.replace(/,(\n)$/, '$1');
            mockRouteText = `\nconst mockObject = [\n${mockRouteText}];\nexport default mockObject;\n`;
            typeText += 'export as namespace ApiDataModel;\n';
            mockText += `${mockImportText}${mockRouteText}`;
            typeText += warningText;
            mockText += warningText;
            if (!fs__default['default'].existsSync(generatePath)) {
                fs__default['default'].mkdirSync(generatePath, { recursive: true });
            }
            fs__default['default'].writeFileSync(`${generatePath}/apiDataModel.d.ts`, typeText);
            fs__default['default'].writeFileSync(`${generatePath}/mockRoute.ts`, mockText);
        });
    });
}

exports.cli = cli;
exports.defineMockApiConfig = defineMockApiConfig;
exports.defineMockServerConfig = defineMockServerConfig;
exports.generateMock = generateMock;
exports.resolveMockApiConfig = resolveMockApiConfig;
exports.resolveMockServerConfig = resolveMockServerConfig$1;
