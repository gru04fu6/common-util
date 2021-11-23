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

export { registerRouterFactory as default };
//# sourceMappingURL=registerRouter.mjs.map
