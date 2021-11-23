
import fs from 'fs';
import path from 'path';
import { resolveMockApiConfig } from './mockApiConfig';

const walk = (dir, done) => {
    let results: string[] = [];
    fs.readdir(dir, (err, list) => {
        if (err) return done(err);
        let pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(_file => {
            const file = path.resolve(dir, _file);
            fs.stat(file, (_, stat) => {
                if (stat && stat.isDirectory()) {
                    walk(file, (__, res) => {
                        results = results.concat(res);
                        pending -= 1;
                        if (!pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    pending -= 1;
                    if (!pending) done(null, results);
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
export async function generateMock() {
    const mockApiConfig = await loadConfig();
    const { mockSrcPath, generatePath, realApiConfigPath } = mockApiConfig;

    walk(mockSrcPath, (err, results) => {
        if (err) throw err;

        let typeText = warningText;
        let mockText = warningText;
        let mockImportText = '';
        let mockRouteText = '';
        let apiConfig = fs.readFileSync(realApiConfigPath, 'utf-8');

        results.sort((a, b) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        });

        results.forEach(p => {
            const filePath = p.replace(/\.ts$/, '');
            const apiPath = path.relative(mockSrcPath, filePath);
            const registerApiPath = `/${apiPath}`;
            const formatName = mockApiConfig.changeTypeName![registerApiPath] ? mockApiConfig.changeTypeName![registerApiPath] : apiPath.replace(/api\//, '');

            const typePath = path.relative(generatePath, filePath);
            const typeName = toUpperCamelCase(formatName);
            typeText += `export * as ${typeName} from '${typePath}';\n`;

            const mockPath = path.relative(generatePath, filePath);
            const mockName = toLowerCamelCase(formatName);
            mockImportText += `import ${mockName} from '${mockPath}';\n`;

            const registerMethod: string[] = [];

            let tempApiConfig = apiConfig;
            let apiRegexp = new RegExp(`'${registerApiPath}'`, 'g');
            let methodRegexp = new RegExp('method:.*?\'(.*?)\'', 'g');

            while(apiRegexp.exec(tempApiConfig)) {
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

        if (!fs.existsSync(generatePath)) {
            fs.mkdirSync(generatePath, { recursive: true });
        }

        fs.writeFileSync(`${generatePath}/apiDataModel.d.ts`, typeText);
        fs.writeFileSync(`${generatePath}/mockRoute.ts`, mockText);
    });
}
