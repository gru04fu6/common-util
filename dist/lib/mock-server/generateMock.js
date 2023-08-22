'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var path = require('path');
var mockApiConfig = require('./mockApiConfig.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

const walk = (dir, done) => {
  let results = [];
  fs__default["default"].readdir(dir, (err, list) => {
    if (err)
      return done(err);
    let pending = list.length;
    if (!pending)
      return done(null, results);
    list.forEach((_file) => {
      const file = path__default["default"].resolve(dir, _file);
      fs__default["default"].stat(file, (_, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (__, res) => {
            results = results.concat(res);
            pending -= 1;
            if (!pending)
              done(null, results);
          });
        } else {
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
  return str.replace(/[-/]/g, " ").replace(/\s(.)/g, ($1) => $1.toUpperCase()).replace(/_(.)/g, ($1) => $1.toUpperCase()).replace(/\s/g, "");
}
function toUpperCamelCase(str) {
  return toCamelCase(str).replace(/^(.)/, ($1) => $1.toUpperCase());
}
function toLowerCamelCase(str) {
  return toCamelCase(str).replace(/^(.)/, ($1) => $1.toLowerCase());
}
const warningText = `// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
//                           \u9019\u500B\u6A94\u6848\u662F\u81EA\u52D5\u7522\u751F\u7684\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83
// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
`;
function loadConfig() {
  return mockApiConfig.resolveMockApiConfig({
    mockSrcPath: "",
    generatePath: "",
    realApiConfigPath: "",
    changeTypeName: {}
  });
}
async function generateMock() {
  const mockApiConfig = await loadConfig();
  const { mockSrcPath, generatePath, realApiConfigPath } = mockApiConfig;
  walk(mockSrcPath, (err, results) => {
    if (err)
      throw err;
    let typeText = warningText;
    let mockText = warningText;
    let mockImportText = "";
    let mockRouteText = "";
    let apiConfig = fs__default["default"].readFileSync(realApiConfigPath, "utf-8");
    results.sort((a, b) => {
      if (a < b)
        return -1;
      if (a > b)
        return 1;
      return 0;
    });
    results.forEach((p) => {
      const filePath = p.replace(/\.ts$/, "");
      const apiPath = path__default["default"].relative(mockSrcPath, filePath);
      const registerApiPath = `/${apiPath}`;
      const formatName = mockApiConfig.changeTypeName[registerApiPath] ? mockApiConfig.changeTypeName[registerApiPath] : apiPath.replace(/api\//, "");
      const typePath = path__default["default"].relative(generatePath, filePath);
      const typeName = toUpperCamelCase(formatName);
      typeText += `export * as ${typeName} from '${typePath}';
`;
      const mockPath = path__default["default"].relative(generatePath, filePath);
      const mockName = toLowerCamelCase(formatName);
      mockImportText += `import ${mockName} from '${mockPath}';
`;
      const registerMethod = [];
      const textScope = "['`\"]";
      let tempApiConfig = apiConfig;
      let apiRegexp = new RegExp(`${textScope}${registerApiPath}${textScope}`, "g");
      let methodRegexp = new RegExp(`method:.*?${textScope}(.*?)${textScope}`, "g");
      while (apiRegexp.exec(tempApiConfig)) {
        tempApiConfig = tempApiConfig.slice(apiRegexp.lastIndex);
        const methodResult = methodRegexp.exec(tempApiConfig);
        if (methodResult) {
          registerMethod.push(methodResult[1]);
        }
        methodRegexp.exec("");
        apiRegexp.exec("");
      }
      if (!registerMethod.length) {
        registerMethod.push("get");
      }
      registerMethod.forEach((method) => {
        const handlerName = registerMethod.length > 1 ? `${mockName}.${method}Handler` : mockName;
        const methodText = method === "get" ? "" : `, method: '${method}' as const`;
        mockRouteText += `    { path: '${registerApiPath}', reqHandler: ${handlerName}${methodText} },
`;
      });
    });
    mockRouteText = mockRouteText.replace(/,(\n)$/, "$1");
    mockRouteText = `
const mockObject = [
${mockRouteText}];
export default mockObject;
`;
    typeText += "export as namespace ApiDataModel;\n";
    mockText += `${mockImportText}${mockRouteText}`;
    typeText += warningText;
    mockText += warningText;
    if (!fs__default["default"].existsSync(generatePath)) {
      fs__default["default"].mkdirSync(generatePath, { recursive: true });
    }
    fs__default["default"].writeFileSync(`${generatePath}/apiDataModel.d.ts`, typeText);
    fs__default["default"].writeFileSync(`${generatePath}/mockRoute.ts`, mockText);
  });
}

exports.generateMock = generateMock;
//# sourceMappingURL=generateMock.js.map
