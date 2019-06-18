function createInterface(global) {
  this.instance = null;

  const sendMessage = message => {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  };

  const sendResponse = (id, result, error) => {
    sendMessage({
      id,
      result,
      error
    });
  };

  const onmessage = e => {
    const message = JSON.parse(e.data);

    switch (message.method) {
      case "get_config":
        sendResponse(message.id, mymonero_core_js.monero_config);
        break;
      default:
        break;
    }
  };

  document.addEventListener("message", onmessage);
  window.addEventListener("message", onmessage);

  sendMessage({
    id: 0,
    method: "init"
  });
}

module.exports = `(${createInterface})(window)`;
