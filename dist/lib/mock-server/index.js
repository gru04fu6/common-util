'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var mockApiConfig = require('./mockApiConfig.js');
require('./registerRouter.js');
var cli = require('./cli.js');
var generateMock = require('./generateMock.js');
var mockServerConfig = require('./mockServerConfig.js');



exports.defineMockApiConfig = mockApiConfig.defineMockApiConfig;
exports.resolveMockApiConfig = mockApiConfig.resolveMockApiConfig;
exports.cli = cli.cli;
exports.generateMock = generateMock.generateMock;
exports.defineMockServerConfig = mockServerConfig.defineMockServerConfig;
exports.resolveMockServerConfig = mockServerConfig.resolveMockServerConfig;
//# sourceMappingURL=index.js.map
