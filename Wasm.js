import React from "react";
import { Platform } from "react-native";
import { WebView } from "react-native-webview";
import iface from "./interface";

export default class Wasm extends React.Component {
  constructor(props) {
    super(props);

    this.counter = 100;
    this.resolvers = {};
    this.rejectors = {};

    this.sendMessage = this.sendMessage.bind(this);
    this.getConfig = this.getConfig.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  sendMessage(message) {
    const { webView } = this.refs;

    const id = this.counter++;

    webView.postMessage(
      JSON.stringify({
        id,
        ...message
      })
    );

    return new Promise((resolve, reject) => {
      this.resolvers[id] = resolve;
      this.rejectors = reject;
    });
  }

  getConfig() {
    return this.sendMessage({
      method: "get_config"
    });
  }

  handleMessage(e) {
    const message = JSON.parse(e.nativeEvent.data);
    const { id, result, error } = message;

    if (id === 0) {
      return this.getConfig().then(config => {
        console.log("config", config);
      });
    }

    if (this.resolvers[id] && result) {
      return this.resolvers[id](result);
    }

    if (this.rejectors[id] && error) {
      return this.rejectors[id](error);
    }
  }

  render() {
    const uri =
      Platform.OS === "android"
        ? "file:///android_asset/monero/index.html"
        : "./monero/index.html";

    return (
      <WebView
        useWebKit
        allowFileAccess
        javaScriptEnabled
        originWhitelist={["*"]}
        ref="webView"
        source={{ uri }}
        injectedJavaScript={iface}
        style={{ width: 100, height: 100 }}
        onMessage={this.handleMessage}
      />
    );
  }
}
