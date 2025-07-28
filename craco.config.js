const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  devServer: {
    port: 5001
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Otimizações para produção
      if (env === 'production') {
        // Otimizações de bundle
        webpackConfig.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5
            }
          }
        };

        // Desabilitar source maps em produção
        webpackConfig.devtool = false;
      }

      // Adicionar Bundle Analyzer se solicitado
      if (process.env.ANALYZE === 'true') {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-report.html'
          })
        );
      }

      return webpackConfig;
    }
  }
}; 