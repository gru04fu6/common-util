import { resolveConfig } from './loadConfig.mjs';

function defineMockApiConfig(config) {
  return config;
}
function resolveMockApiConfig(inlineConfig) {
  return resolveConfig(inlineConfig, "mock-api.config");
}

export { defineMockApiConfig, resolveMockApiConfig };
//# sourceMappingURL=mockApiConfig.mjs.map
