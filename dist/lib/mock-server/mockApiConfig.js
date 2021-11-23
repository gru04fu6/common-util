'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var loadConfig = require('./loadConfig.js');

function defineMockApiConfig(config) {
  return config;
}
function resolveMockApiConfig(inlineConfig) {
  return loadConfig.resolveConfig(inlineConfig, "mock-api.config");
}

exports.defineMockApiConfig = defineMockApiConfig;
exports.resolveMockApiConfig = resolveMockApiConfig;
//# sourceMappingURL=mockApiConfig.js.map
