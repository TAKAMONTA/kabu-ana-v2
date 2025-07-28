import { defineConfig } from 'vite';
<<<<<<< HEAD
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import terser from '@rollup/plugin-terser';
import { VitePWA } from 'vite-plugin-pwa';

// 環境変数の取得
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './')
    }
  },
  build: {
    // 本番ビルド最適化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: isProduction, // 本番環境ではconsole.logを削除
        drop_debugger: isProduction
      }
    },
    rollupOptions: {
      output: {
        // チャンク分割の最適化
        manualChunks: {
          vendor: ['react', 'react-dom'],
          paypal: ['@paypal/paypal-js']
        },
        // アセットのファイル名にハッシュを含める
        entryFileNames: isProduction ? 'assets/[name].[hash].js' : 'assets/[name].js',
        chunkFileNames: isProduction ? 'assets/[name].[hash].js' : 'assets/[name].js',
        assetFileNames: isProduction ? 'assets/[name].[hash].[ext]' : 'assets/[name].[ext]'
      },
      plugins: isProduction ? [
        terser(), // コード圧縮
        visualizer({ // バンドル分析レポート生成
          filename: './dist/stats.html',
          open: false,
          gzipSize: true
        })
      ] : []
    },
    // ソースマップ設定
    sourcemap: !isProduction,
    // キャッシュ設定
    assetsInlineLimit: 4096, // 4KB以下のアセットをインライン化
  },
  
  // PWA設定
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'AI株式分析',
        short_name: 'AI株式',
        theme_color: '#1a365d',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // キャッシュ戦略
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.paypal\.com\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'paypal-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 24時間
              }
            }
          },
          {
            urlPattern: /\.(js|css|png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30日
              }
            }
          }
        ]
      }
    })
  ],
  // 開発サーバー設定
  server: {
    port: 3000, // フロントエンドの開発サーバーポート
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // バックエンドサーバー
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: true
    },
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    }
  }
});
=======
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'esbuild' : false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
        secure: true,
        timeout: 10000, // 10秒のタイムアウト
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Yahoo Finance API proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to Yahoo Finance:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from Yahoo Finance:', proxyRes.statusCode, req.url);
          });
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Referer': 'https://finance.yahoo.com/',
          'Origin': 'https://finance.yahoo.com'
        }
      }
    }
  }
}));
>>>>>>> 63c8400919333443c24ba6cc3c3a6ad87153c33b
