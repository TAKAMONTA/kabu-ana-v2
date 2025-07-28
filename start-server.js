// start-server.js - ポート管理用スクリプト
const { spawn, exec } = require('child_process');
const net = require('net');

// 利用可能なポートを見つける関数
function findAvailablePort(startPort = 3000, maxPort = 3100) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        if (startPort < maxPort) {
          resolve(findAvailablePort(startPort + 1, maxPort));
        } else {
          reject(new Error(`No available ports between ${3000} and ${maxPort}`));
        }
      } else {
        reject(err);
      }
    });
  });
}

// Windows用：ポートを使用しているプロセスを終了
function killPortProcessWindows(port) {
  return new Promise((resolve) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error || !stdout) {
        resolve();
        return;
      }
      
      const lines = stdout.split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const match = line.match(/\s+(\d+)$/);
        if (match) {
          pids.add(match[1]);
        }
      });
      
      if (pids.size === 0) {
        resolve();
        return;
      }
      
      console.log(`🔄 ポート ${port} を使用中のプロセスを終了しています...`);
      
      Promise.all([...pids].map(pid => {
        return new Promise((resolvePid) => {
          exec(`taskkill /PID ${pid} /F`, (error) => {
            if (!error) {
              console.log(`✅ プロセス ${pid} を終了しました`);
            }
            resolvePid();
          });
        });
      })).then(() => {
        setTimeout(resolve, 1000); // 1秒待機
      });
    });
  });
}

// メイン処理
async function startServer() {
  const desiredPort = process.env.PORT || 3000;
  
  console.log(`🚀 AI Stock Analyst サーバーを起動しています...`);
  console.log(`📍 希望ポート: ${desiredPort}`);
  
  try {
    // まず希望ポートでプロセスを終了を試行
    if (process.platform === 'win32') {
      await killPortProcessWindows(desiredPort);
    }
    
    // 利用可能なポートを見つける
    const availablePort = await findAvailablePort(parseInt(desiredPort));
    
    if (availablePort !== parseInt(desiredPort)) {
      console.log(`⚠️  ポート ${desiredPort} が使用中のため、ポート ${availablePort} を使用します`);
    }
    
    // 環境変数を設定してサーバーを起動
    const env = { ...process.env, PORT: availablePort.toString() };
    
    const serverProcess = spawn('node', ['server.js'], {
      env,
      stdio: 'inherit',
      shell: true
    });
    
    serverProcess.on('error', (error) => {
      console.error('❌ サーバー起動エラー:', error);
      process.exit(1);
    });
    
    serverProcess.on('exit', (code) => {
      console.log(`🛑 サーバーが終了しました (終了コード: ${code})`);
      process.exit(code);
    });
    
    // Ctrl+C でのグレースフル終了
    process.on('SIGINT', () => {
      console.log('\n🛑 サーバーを終了しています...');
      serverProcess.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 サーバーを終了しています...');
      serverProcess.kill('SIGTERM');
    });
    
  } catch (error) {
    console.error('❌ ポート確認エラー:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  startServer();
}

module.exports = { findAvailablePort, killPortProcessWindows, startServer };
