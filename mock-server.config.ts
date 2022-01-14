import { defineMockServerConfig } from './dist/es/mock-server';

export default defineMockServerConfig({
    port: 3030,
    watchDir: './src/mock',
    registerRouter(registerRouter) {
        registerRouter({
            path: '/abc',
            reqHandler: req => ({ abc: 'abc' })
        });
    }
});
