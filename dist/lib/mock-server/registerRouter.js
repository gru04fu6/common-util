'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function registerRouterFactory(router) {
  const registerRouter = ({
    method = "get",
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

exports["default"] = registerRouterFactory;
//# sourceMappingURL=registerRouter.js.map
