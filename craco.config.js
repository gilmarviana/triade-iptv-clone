module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Otimizações básicas para produção
      if (env === 'production') {
        // Desabilitar source maps em produção
        webpackConfig.devtool = false;
        
        // Otimizações básicas de bundle
        webpackConfig.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            }
          },
        };
      }

      return webpackConfig;
    }
  }
}; 