const { override } = require('customize-cra');

module.exports = {
  webpack: override(
    (config) => {
      return config;
    }
  ),
  devServer: function(configFunction) {
    return function(proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      config.allowedHosts = ['all'];
      return config;
    };
  }
};
