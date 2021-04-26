import type { Router, Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
export declare type RegisterRouterFunction = (param: {
    method?: 'get' | 'delete' | 'put' | 'post';
    path: string;
    reqHandler: (req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>) => any;
    time?: number;
}) => void;
declare function registerRouterFactory(router: Router): RegisterRouterFunction;
export default registerRouterFactory;
