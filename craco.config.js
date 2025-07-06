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
                pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
                passes: 2
              },
              mangle: {
                safari10: true
              }
            },
            extractComments: false
          })
        ];

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
  },
  
  // Otimizações de Babel
  babel: {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['>0.2%', 'not dead', 'not op_mini all']
          },
          useBuiltIns: 'usage',
          corejs: 3
        }
      ]
    ],
    plugins: [
      // Remover PropTypes em produção
      env === 'production' && [
        'transform-react-remove-prop-types',
        {
          removeImport: true
        }
      ]
    ].filter(Boolean)
  }
}; 