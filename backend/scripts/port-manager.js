import { exec } from 'child_process';
import { promisify } from 'util';
import { createServer } from 'net';

const execAsync = promisify(exec);

class PortManager {
  constructor() {
    this.isWindows = process.platform === 'win32';
  }

  // Check if a port is available
  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = createServer();
      server.listen(port, () => {
        server.once('close', () => resolve(true));
        server.close();
      });
      server.on('error', () => resolve(false));
    });
  }

  // Find available port starting from a given port
  async findAvailablePort(startPort, maxAttempts = 100) {
    let port = startPort;
    for (let i = 0; i < maxAttempts; i++) {
      if (await this.isPortAvailable(port)) {
        return port;
      }
      port++;
    }
    throw new Error(`No available port found starting from ${startPort}`);
  }

  // Get process using a specific port
  async getProcessUsingPort(port) {
    try {
      if (this.isWindows) {
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        const lines = stdout.trim().split('\n');
        const processes = [];
        
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            const localAddress = parts[1];
            const pid = parts[4];
            
            if (localAddress.includes(`:${port}`)) {
              try {
                const { stdout: taskInfo } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
                const taskParts = taskInfo.trim().split(',');
                const processName = taskParts[0]?.replace(/"/g, '') || 'Unknown';
                
                processes.push({
                  pid: parseInt(pid),
                  name: processName,
                  port: port
                });
              } catch (error) {
                // Process might have ended, ignore
              }
            }
          }
        }
        
        return processes;
      } else {
        // macOS/Linux
        const { stdout } = await execAsync(`lsof -i :${port}`);
        const lines = stdout.trim().split('\n').slice(1); // Skip header
        const processes = [];
        
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 2) {
            processes.push({
              pid: parseInt(parts[1]),
              name: parts[0],
              port: port
            });
          }
        }
        
        return processes;
      }
    } catch (error) {
      return []; // No processes found or command failed
    }
  }

  // Kill process by PID
  async killProcess(pid) {
    try {
      if (this.isWindows) {
        await execAsync(`taskkill /PID ${pid} /F`);
      } else {
        await execAsync(`kill -9 ${pid}`);
      }
      return true;
    } catch (error) {
      console.error(`Failed to kill process ${pid}:`, error.message);
      return false;
    }
  }

  // Kill all Node.js processes
  async killAllNodeProcesses() {
    try {
      if (this.isWindows) {
        await execAsync('taskkill /F /IM node.exe');
        console.log('✅ All Node.js processes terminated');
      } else {
        await execAsync('pkill -f node');
        console.log('✅ All Node.js processes terminated');
      }
      return true;
    } catch (error) {
      console.log('ℹ️  No Node.js processes found to terminate');
      return false;
    }
  }

  // Kill processes using a specific port
  async killProcessesUsingPort(port) {
    const processes = await this.getProcessUsingPort(port);
    
    if (processes.length === 0) {
      console.log(`ℹ️  No processes found using port ${port}`);
      return true;
    }

    console.log(`🔍 Found ${processes.length} process(es) using port ${port}:`);
    
    let allKilled = true;
    for (const process of processes) {
      console.log(`   - ${process.name} (PID: ${process.pid})`);
      const killed = await this.killProcess(process.pid);
      if (!killed) {
        allKilled = false;
      } else {
        console.log(`   ✅ Killed ${process.name} (PID: ${process.pid})`);
      }
    }

    return allKilled;
  }

  // Display port usage information
  async displayPortInfo(port) {
    console.log(`🔍 Checking port ${port}...`);
    
    const isAvailable = await this.isPortAvailable(port);
    
    if (isAvailable) {
      console.log(`✅ Port ${port} is available`);
    } else {
      console.log(`❌ Port ${port} is in use`);
      const processes = await this.getProcessUsingPort(port);
      
      if (processes.length > 0) {
        console.log('📋 Processes using this port:');
        processes.forEach(process => {
          console.log(`   - ${process.name} (PID: ${process.pid})`);
        });
      }
    }
  }
}

// CLI interface
const portManager = new PortManager();

const command = process.argv[2];
const port = parseInt(process.argv[3]);

switch (command) {
  case 'check':
    if (!port) {
      console.error('Usage: node port-manager.js check <port>');
      process.exit(1);
    }
    portManager.displayPortInfo(port);
    break;

  case 'kill':
    if (!port) {
      console.error('Usage: node port-manager.js kill <port>');
      process.exit(1);
    }
    portManager.killProcessesUsingPort(port)
      .then(success => {
        if (success) {
          console.log(`✅ Successfully freed port ${port}`);
        } else {
          console.log(`⚠️  Some processes could not be killed on port ${port}`);
        }
      });
    break;

  case 'kill-all-node':
    portManager.killAllNodeProcesses();
    break;

  case 'find':
    const startPort = port || 8000;
    portManager.findAvailablePort(startPort)
      .then(availablePort => {
        console.log(`✅ Available port found: ${availablePort}`);
      })
      .catch(error => {
        console.error(`❌ ${error.message}`);
      });
    break;

  default:
    console.log('🛠️  Port Manager - Promptify Backend');
    console.log('=====================================');
    console.log('');
    console.log('Usage:');
    console.log('  node port-manager.js check <port>     - Check if port is available');
    console.log('  node port-manager.js kill <port>      - Kill processes using port');
    console.log('  node port-manager.js kill-all-node    - Kill all Node.js processes');
    console.log('  node port-manager.js find [port]      - Find available port (default: 8000)');
    console.log('');
    console.log('Examples:');
    console.log('  node port-manager.js check 8001');
    console.log('  node port-manager.js kill 8001');
    console.log('  node port-manager.js find 8000');
    break;
}

export default PortManager;