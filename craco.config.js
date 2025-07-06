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
                passes: 3, // Aumentar passes para melhor otimização
                dead_code: true, // Remove código morto
                unused: true, // Remove variáveis não utilizadas
                toplevel: true, // Otimizações de nível superior
                hoist_funs: true, // Hoist functions
                hoist_vars: true, // Hoist variables
                if_return: true, // Otimiza if/return
                join_vars: true, // Join variables
                collapse_vars: true, // Collapse variables
                reduce_vars: true, // Reduce variables
                sequences: true, // Use comma operator
                side_effects: true, // Remove side effects
                properties: true, // Optimize property access
                conditionals: true, // Optimize conditionals
                comparisons: true, // Optimize comparisons
                evaluate: true, // Evaluate constant expressions
                booleans: true, // Optimize booleans
                loops: true, // Optimize loops
                typeofs: true, // Optimize typeof
                unsafe: false, // Don't use unsafe optimizations
                unsafe_comps: false, // Don't use unsafe comparisons
                unsafe_Function: false, // Don't use unsafe Function
                unsafe_math: false, // Don't use unsafe math
                unsafe_methods: false, // Don't use unsafe methods
                unsafe_proto: false, // Don't use unsafe proto
                unsafe_regexp: false, // Don't use unsafe regexp
                unsafe_undefined: false // Don't use unsafe undefined
              },
              mangle: {
                safari10: true,
                toplevel: true, // Mangle top-level names
                eval: true, // Mangle names in eval
                keep_fnames: false, // Don't keep function names
                reserved: ['$', 'jQuery'] // Reserved names
              },
              format: {
                comments: false, // Remove comments
                ascii_only: true, // Use ASCII only
                beautify: false, // Don't beautify
                indent_level: 0, // No indentation
                semicolons: true, // Use semicolons
                quote_keys: false, // Don't quote keys
                quote_style: 1, // Single quotes
                preserve_annotations: false, // Don't preserve annotations
                preamble: null, // No preamble
                quote_style: 1, // Single quotes
                wrap_iife: true, // Wrap IIFE
                wrap_func_args: true, // Wrap function arguments
                ecma: 2020, // ECMAScript version
                keep_numbers: false, // Don't keep numbers
                keep_strings: false, // Don't keep strings
                keep_quoted_strings: false, // Don't keep quoted strings
                inline_script: false, // Don't inline script
                url_base: null, // No URL base
                url_quote: false, // Don't quote URLs
                url_unsafe: false, // Don't use unsafe URLs
                source_map: false, // No source map
                root: null, // No root
                toplevel: false, // Don't mangle toplevel
                names: false, // Don't mangle names
                ie8: false, // Don't support IE8
                safari10: true, // Support Safari 10
                keep_classnames: false, // Don't keep class names
                keep_fnames: false, // Don't keep function names
                reserved: ['$', 'jQuery'] // Reserved names
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
          minSize: 20000, // Tamanho mínimo do chunk
          maxSize: 244000, // Tamanho máximo do chunk
          minChunks: 1, // Mínimo de chunks
          maxAsyncRequests: 30, // Máximo de requests assíncronos
          maxInitialRequests: 30, // Máximo de requests iniciais
          automaticNameDelimiter: '~', // Delimitador do nome
          enforceSizeThreshold: 50000, // Threshold para forçar split
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
              name: 'vendors'
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
              name: 'common'
            },
            // Chunks específicos para melhor cache
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              priority: 10,
              reuseExistingChunk: true
            },
            router: {
              test: /[\\/]node_modules[\\/](react-router|react-router-dom)[\\/]/,
              name: 'router',
              priority: 10,
              reuseExistingChunk: true
            },
            utils: {
              test: /[\\/]src[\\/]utils[\\/]/,
              name: 'utils',
              priority: 5,
              reuseExistingChunk: true
            },
            components: {
              test: /[\\/]src[\\/]components[\\/]/,
              name: 'components',
              priority: 5,
              reuseExistingChunk: true
            }
          }
        };

        // Otimizações de performance
        webpackConfig.optimization.runtimeChunk = 'single';
        webpackConfig.optimization.moduleIds = 'deterministic';
        webpackConfig.optimization.chunkIds = 'deterministic';

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
          targets: {
            browsers: ['>0.2%', 'not dead', 'not op_mini all']
          },
          useBuiltIns: 'usage',
          corejs: 3,
          modules: false // Otimização para tree-shaking
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
      ],
      // Otimizações adicionais
      env === 'production' && [
        '@babel/plugin-transform-runtime',
        {
          corejs: 3,
          helpers: true,
          regenerator: true,
          useESModules: true
        }
      ]
    ].filter(Boolean)
  }
}; 