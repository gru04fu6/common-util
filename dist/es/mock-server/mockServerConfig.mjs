import { resolveConfig } from './loadConfig.mjs';

function defineMockServerConfig(config) {
  return config;
}
function resolveMockServerConfig(inlineConfig) {
  return resolveConfig(inlineConfig, "mock-server.config");
}

export { defineMockServerConfig, resolveMockServerConfig };
//# sourceMappingURL=mockServerConfig.mjs.map
