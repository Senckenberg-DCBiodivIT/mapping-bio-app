const { defineConfig } = require("@vue/cli-service");
const webpack = require("webpack");

module.exports = defineConfig({
  transpileDependencies: true,
});

module.exports = {
  // publicPath:
  //   process.env.NODE_ENV === 'production'
  //     ? '/wildlive-frontend'
  //     : '/wildlive-frontend',

  publicPath: process.env.VUE_APP_BASE_URL ?? process.env.BASE_URL,
  // chainWebpack: (config) => {
  //   config.plugin('html').tap((args) => {
  //     args[0].title = 'Wildlive portal';
  //     return args;
  //   });
  // },

  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        process: "process/browser",
      }),
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
    ],

    resolve: {
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        http: require.resolve("stream-http"),
        https: false,
        path: false,
        fs: false,
      },
    },
  },
};
