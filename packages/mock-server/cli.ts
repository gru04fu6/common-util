const express = require('express');
const bodyParser = require('body-parser');

import { resolveConfig }  from './config';
import registerRouterFactory  from './registerRouter';

export async function cli() {
    const config = await resolveConfig({
        port: 3000
    });

    const MockServer = express();

    MockServer.set('port', config.port);
    MockServer.use((req: any, res: any, next: any) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS');
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
        routes.get('/example', (req: any, res: any) => setTimeout(() => res.json({ data: 'example data' }), 200));
    }

    MockServer.use('/', routes);
    MockServer.listen(MockServer.get('port'), () => {
        console.log(`Mock server is running at http://localhost:${MockServer.get('port')}`);
    });
}




