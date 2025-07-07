const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Otimizações para produção
      if (env === 'production') {
        // Configuração do Terser para minificação mais agressiva
        webpackConfig.optimization.minimizer = [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true, // Remove console.log
                drop_debugger: true, // Remove debugger
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
                passes: 2
              },
              mangle: {
                safari10: true
              }
            },
            extractComments: false,
            parallel: true, // Use parallel processing
            minify: TerserPlugin.terserMinify // Use terser minifier
          })
        ];

        // Otimizações de bundle mais agressivas
        webpackConfig.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true,
            },
          },
        };

        // Otimizações de performance
        webpackConfig.optimization.runtimeChunk = 'single';
        webpackConfig.optimization.moduleIds = 'deterministic';
        webpackConfig.optimization.chunkIds = 'deterministic';
        
        // Tree shaking agressivo
        webpackConfig.optimization.usedExports = true;
        webpackConfig.optimization.sideEffects = false;

        // Desabilitar source maps em produção
        webpackConfig.devtool = false;
      }

      // Adicionar Bundle Analyzer se solicitado
      if (process.env.ANALYZE === 'true') {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-report.html',
            generateStatsFile: true,
            statsFilename: 'bundle-stats.json'
          })
        );
      }

      return webpackConfig;
    }
  },
  
  // Otimizações de Babel
  babel: {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          corejs: 3
        }
      ]
    ]
  }
}; 