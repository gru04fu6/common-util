'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var path = require('path');
var rollup = require('rollup');
var pluginNodeResolve = require('@rollup/plugin-node-resolve');
var esbuild = require('rollup-plugin-esbuild');
var commonjs = require('@rollup/plugin-commonjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var esbuild__default = /*#__PURE__*/_interopDefaultLegacy(esbuild);
var commonjs__default = /*#__PURE__*/_interopDefaultLegacy(commonjs);

const debugMode = false;
function debug(...str) {
  if (debugMode) {
    console.log(...str);
  }
}
async function bundleConfigFile(fileName) {
  const bundle = await rollup.rollup({
    input: fileName,
    plugins: [
      pluginNodeResolve.nodeResolve(),
      commonjs__default["default"](),
      esbuild__default["default"]({
        sourceMap: true,
        target: "es2018"
      })
    ],
    external: (id) => id[0] !== "." && !path__default["default"].isAbsolute(id) || id.slice(-5, id.length) === ".json",
    treeshake: false
  });
  const {
    output: [{ code }]
  } = await bundle.generate({
    exports: "named",
    format: "cjs"
  });
  return code;
}
async function loadConfigFromBundledFile(fileName, bundledCode) {
  const extension = path__default["default"].extname(fileName);
  const defaultLoader = require.extensions[extension];
  require.extensions[extension] = (module, filename) => {
    if (filename === fileName) {
      module._compile(bundledCode, filename);
    } else {
      defaultLoader(module, filename);
    }
  };
  delete require.cache[require.resolve(fileName)];
  const raw = require(fileName);
  const config = raw.__esModule ? raw.default : raw;
  require.extensions[extension] = defaultLoader;
  return config;
}
function isFunction(fnOrObj) {
  return typeof fnOrObj === "function";
}
async function resolveConfig(inlineConfig, configName, configRoot = process.cwd()) {
  const loadResult = await loadConfigFromFile(configName, configRoot);
  const config = Object.assign(inlineConfig, loadResult);
  return config;
}
async function loadConfigFromFile(configName, configRoot = process.cwd()) {
  const start = Date.now();
  let resolvedPath;
  let isTS = false;
  const jsconfigFile = path__default["default"].resolve(configRoot, `${configName}.js`);
  if (fs__default["default"].existsSync(jsconfigFile)) {
    resolvedPath = jsconfigFile;
  }
  if (!resolvedPath) {
    const tsconfigFile = path__default["default"].resolve(configRoot, `${configName}.ts`);
    if (fs__default["default"].existsSync(tsconfigFile)) {
      resolvedPath = tsconfigFile;
      isTS = true;
    }
  }
  if (!resolvedPath) {
    debug("no config file found.");
    return null;
  }
  try {
    let userConfig;
    if (isTS) {
      const code = await bundleConfigFile(resolvedPath);
      userConfig = await loadConfigFromBundledFile(resolvedPath, code);
      debug(`bundled config file loaded in ${Date.now() - start}ms`);
    } else {
      try {
        delete require.cache[require.resolve(resolvedPath)];
        userConfig = require(resolvedPath);
        debug(`cjs config loaded in ${Date.now() - start}ms`);
      } catch (e) {
        const ignored = new RegExp([
          "Cannot use import statement",
          "Unexpected token 'export'",
          "Must use import to load ES Module",
          "Unexpected identifier"
        ].join("|"));
        if (!ignored.test(e.message)) {
          throw e;
        }
      }
    }
    const config = isFunction(userConfig) ? userConfig() : userConfig;
    if (!(config instanceof Object)) {
      throw new Error("config must export or return an object.");
    }
    return config;
  } catch (e) {
    debug(`failed to load config from ${resolvedPath}`);
    throw e;
  }
}

exports.loadConfigFromFile = loadConfigFromFile;
exports.resolveConfig = resolveConfig;
//# sourceMappingURL=loadConfig.js.map
