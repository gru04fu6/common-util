'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var express = require('express');
var bodyParser = require('body-parser');
var chokidar = require('chokidar');
var path = require('path');
var mockServerConfig = require('./mockServerConfig.js');
var registerRouter = require('./registerRouter.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var bodyParser__default = /*#__PURE__*/_interopDefaultLegacy(bodyParser);
var chokidar__default = /*#__PURE__*/_interopDefaultLegacy(chokidar);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

let server;
let lock = false;
function loadConfig() {
  return mockServerConfig.resolveMockServerConfig({
    port: 3e3
  });
}
function startWatch(watchFolder = "./mock") {
  const configRoot = process.cwd();
  let rootFolder = path__default["default"].resolve(configRoot, watchFolder);
  const watcher = chokidar__default["default"].watch([
    path__default["default"].resolve(configRoot, "mock-server.config.js"),
    path__default["default"].resolve(configRoot, "mock-server.config.ts"),
    rootFolder
  ], {
    persistent: true,
    ignoreInitial: true
  });
  console.log(`watch file on folder: ${rootFolder}`);
  watcher.on("ready", function() {
    watcher.on("all", function() {
      if (!lock) {
        console.log("restart mock server");
        lock = true;
        server.close(async () => {
          const config = await loadConfig();
          await startApp(config);
          lock = false;
        });
      }
    });
  });
}
function startApp(config) {
  return new Promise((resolve) => {
    const MockServer = express__default["default"]();
    MockServer.set("port", config.port);
    MockServer.use((_, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS");
      res.set("Connection", "close");
      next();
    });
    MockServer.use(bodyParser__default["default"].urlencoded({
      extended: true,
      parameterLimit: 1e4,
      limit: 1024 * 1024 * 10
    }));
    MockServer.use(bodyParser__default["default"].json());
    if (config.settingServer) {
      config.settingServer(MockServer);
    }
    const routes = express__default["default"].Router();
    if (config.registerRouter) {
      config.registerRouter(registerRouter["default"](routes));
    } else {
      routes.get("/example", (_, res, next) => setTimeout(() => {
        res.json({ data: "example data" });
        next();
      }, 200));
    }
    MockServer.use("/", function(req, res, next) {
      routes(req, res, next);
    });
    server = MockServer.listen(config.port, () => {
      console.log(`Mock server is running at http://localhost:${config.port}`);
      resolve();
    });
  });
}
async function cli() {
  const config = await loadConfig();
  await startApp(config);
  startWatch(config.watchDir);
}

exports.cli = cli;
//# sourceMappingURL=cli.js.map
