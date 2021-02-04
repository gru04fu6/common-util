import type { Router } from 'express';
declare function registerRouterFactory(router: Router): ({ method, path, reqHandler, time }: {
    method?: 'get' | 'delete' | 'put' | 'post';
    path: string;
    reqHandler: (req: any) => any;
    time?: number;
}) => void;
export default registerRouterFactory;
