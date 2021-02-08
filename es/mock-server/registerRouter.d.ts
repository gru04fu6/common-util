import type { Router } from 'express';
export declare type RegisterRouterFunction = (param: {
    method?: 'get' | 'delete' | 'put' | 'post';
    path: string;
    reqHandler: (req: any) => any;
    time?: number;
}) => void;
declare function registerRouterFactory(router: Router): RegisterRouterFunction;
export default registerRouterFactory;
