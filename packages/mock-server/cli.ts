import express from 'express';
import { Server } from 'http';
import bodyParser from 'body-parser';
import chokidar from 'chokidar';
import path from 'path';

import { resolveConfig, UserConfig }  from './config';
import registerRouterFactory  from './registerRouter';

let server: Server;
let lock = false;

function loadConfig() {
    return resolveConfig({
        port: 3000
    });
}

function startWatch(watchFolder = './mock') {
    const configRoot = process.cwd();
    let rootFolder = path.resolve(configRoot, watchFolder);

    const watcher = chokidar.watch([
        path.resolve(configRoot, 'mock-server.config.js'),
        path.resolve(configRoot, 'mock-server.config.ts'),
        rootFolder
    ]);

    console.log(`watch file on folder: ${rootFolder}`);

    watcher.on('ready', function() {
        watcher.on('all', function() {
            if (!lock) {
                console.log('restart mock server');
                lock = true;

                server.close(async () => {
                    const config = await loadConfig();

                    startApp(config);
                    lock = false;
                });
            }
        });
    });
}

function startApp(config: UserConfig) {
    const MockServer = express();

    MockServer.set('port', config.port);
    MockServer.use((req: any, res: any, next: any) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS');
        res.set('Connection', 'close');
        next();
    });

    MockServer.use(bodyParser.urlencoded({
        extended: true,
        parameterLimit: 10000,
        limit: 1024 * 1024 * 10
    }));
    MockServer.use(bodyParser.json());

    if (config.settingServer) {
        config.settingServer(MockServer);
    }

    const routes = express.Router();

    if (config.registerRouter) {
        config.registerRouter(registerRouterFactory(routes));
    } else {
        routes.get('/example', (req, res, next) => setTimeout(() => {
            res.json({ data: 'example data' });
            next();
        }, 200));
    }

    MockServer.use('/', function(req, res, next) {
        routes(req, res, next);
    });

    server = MockServer.listen(MockServer.get('port'), () => {
        console.log(`Mock server is running at http://localhost:${MockServer.get('port')}`);
    });
}

export async function cli() {
    const config = await loadConfig();

    startApp(config);
    startWatch(config.watchDir);
}




