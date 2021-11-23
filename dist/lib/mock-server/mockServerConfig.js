'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var loadConfig = require('./loadConfig.js');

function defineMockServerConfig(config) {
  return config;
}
function resolveMockServerConfig(inlineConfig) {
  return loadConfig.resolveConfig(inlineConfig, "mock-server.config");
}

exports.defineMockServerConfig = defineMockServerConfig;
exports.resolveMockServerConfig = resolveMockServerConfig;
//# sourceMappingURL=mockServerConfig.js.map
