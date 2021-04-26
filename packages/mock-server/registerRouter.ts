import type { Router, Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export type RegisterRouterFunction = (param: {
    method?: 'get' | 'delete' | 'put' | 'post';
    path: string;
    reqHandler: (req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>) => any;
    time?: number
}) => void;

function registerRouterFactory(router: Router) {
    /**
     * 呼叫 API 方法
     * @param  {String} method 請求方式
     * @param  {String} path API 路徑
     * @param  {Object} json 回傳的 json 物件
     * @param  {Number} time 模擬回傳的時間
     */
    const registerRouter: RegisterRouterFunction = ({
        method = 'get',
        path,
        reqHandler,
        time = 800
    }) => {
        router[method](path, (req, res) => {
            console.log(req.url);
            setTimeout(() => {
                res.json(reqHandler.bind({}, req)());
            }, time);
        });
    };

    return registerRouter;
}

export default registerRouterFactory;
