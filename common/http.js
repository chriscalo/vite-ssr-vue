async function listen(app, port) {
  return new Promise((resolve, reject) => {
    const listener = app.listen(port, "localhost", function () {
      const { port } = listener.address();
      const url = `http://localhost:${port}`;
      resolve({
        url,
        port,
      });
    });
  });
}

class RelativeURL extends URL {
  constructor(input, base = "http://unspecified") {
    super(input, base);
  }
}

export {
  listen,
  RelativeURL,
};
