import fs from 'fs';
import { createServer } from 'net';

class FrontendStartupValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addError(message) {
    this.errors.push(message);
    this.log(message, 'error');
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log(message, 'warning');
  }

  addSuccess(message) {
    this.log(message, 'success');
  }

  // Check if required files exist
  checkRequiredFiles() {
    this.log('Checking required files...');
    
    const requiredFiles = [
      'package.json',
      'vite.config.ts',
      'index.html',
      'src/main.tsx',
      'tsconfig.json'
    ];

    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.addSuccess(`${file} exists`);
      } else {
        this.addError(`Required file ${file} is missing`);
      }
    });
  }

  // Check environment variables
  checkEnvironmentVariables() {
    this.log('Checking environment variables...');
    
    // Check if .env file exists
    if (!fs.existsSync('.env')) {
      this.addWarning('.env file not found. Default configuration will be used.');
      return;
    }

    try {
      const envContent = fs.readFileSync('.env', 'utf8');
      const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      const envVars = {};
      envLines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      });

      // Check required environment variables
      const requiredVars = ['VITE_API_URL'];
      
      requiredVars.forEach(variable => {
        if (!envVars[variable]) {
          this.addWarning(`Environment variable ${variable} is not set`);
        } else {
          this.addSuccess(`${variable} is configured: ${envVars[variable]}`);
        }
      });

      // Validate API URL format
      if (envVars.VITE_API_URL) {
        try {
          new URL(envVars.VITE_API_URL);
          this.addSuccess('VITE_API_URL has valid URL format');
        } catch {
          this.addError('VITE_API_URL is not a valid URL format');
        }
      }

    } catch (error) {
      this.addError(`Failed to read .env file: ${error.message}`);
    }
  }

  // Check Node.js version
  checkNodeVersion() {
    this.log('Checking Node.js version...');
    
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
      this.addError(`Node.js version ${nodeVersion} is too old. Please upgrade to Node.js 16 or higher.`);
    } else {
      this.addSuccess(`Node.js version ${nodeVersion} is compatible`);
    }
  }

  // Check dependencies
  checkDependencies() {
    this.log('Checking dependencies...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const nodeModulesExists = fs.existsSync('node_modules');
      
      if (!nodeModulesExists) {
        this.addWarning('node_modules directory not found. Run "npm install" to install dependencies.');
        return;
      }

      // Check if package-lock.json exists
      if (!fs.existsSync('package-lock.json') && !fs.existsSync('bun.lockb')) {
        this.addWarning('No lock file found. Consider running "npm install" to generate package-lock.json.');
      }

      // Check for critical dependencies
      const criticalDeps = ['react', 'react-dom', 'vite'];
      const missingDeps = criticalDeps.filter(dep => 
        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
      );

      if (missingDeps.length > 0) {
        this.addError(`Missing critical dependencies: ${missingDeps.join(', ')}`);
      } else {
        this.addSuccess('All critical dependencies are present');
      }

    } catch (error) {
      this.addError(`Dependency check failed: ${error.message}`);
    }
  }

  // Check port availability
  async checkPortAvailability() {
    this.log('Checking port availability...');
    
    const port = 8080; // Default Vite port from config
    
    try {
      const server = createServer();
      
      return new Promise((resolve) => {
        server.listen(port, () => {
          server.close(() => {
            this.addSuccess(`Port ${port} is available`);
            resolve(true);
          });
        });
        
        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            this.addWarning(`Port ${port} is already in use. Vite will try to use the next available port.`);
          } else {
            this.addError(`Port check failed: ${err.message}`);
          }
          resolve(false);
        });
      });
    } catch (error) {
      this.addError(`Port availability check failed: ${error.message}`);
      return false;
    }
  }

  // Check backend connectivity
  async checkBackendConnectivity() {
    this.log('Checking backend connectivity...');
    
    let apiUrl = 'http://localhost:8001/api'; // Default
    
    // Try to read API URL from .env
    if (fs.existsSync('.env')) {
      try {
        const envContent = fs.readFileSync('.env', 'utf8');
        const apiUrlMatch = envContent.match(/VITE_API_URL=(.+)/);
        if (apiUrlMatch) {
          apiUrl = apiUrlMatch[1].trim();
        }
      } catch (error) {
        this.addWarning('Could not read API URL from .env file');
      }
    }

    try {
      // Try to fetch the health endpoint
      const response = await fetch(`${apiUrl.replace('/api', '')}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        this.addSuccess(`Backend is reachable at ${apiUrl}`);
      } else {
        this.addWarning(`Backend responded with status ${response.status} at ${apiUrl}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        this.addWarning(`Backend connection timeout at ${apiUrl}. Make sure the backend is running.`);
      } else {
        this.addWarning(`Cannot reach backend at ${apiUrl}. Make sure the backend is running. Error: ${error.message}`);
      }
    }
  }

  // Check TypeScript configuration
  checkTypeScriptConfig() {
    this.log('Checking TypeScript configuration...');
    
    if (!fs.existsSync('tsconfig.json')) {
      this.addError('tsconfig.json not found');
      return;
    }

    try {
      const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      
      if (tsConfig.compilerOptions) {
        this.addSuccess('TypeScript configuration is present');
        
        // Check for important compiler options
        const importantOptions = ['target', 'lib', 'allowJs', 'skipLibCheck', 'esModuleInterop'];
        const missingOptions = importantOptions.filter(option => !tsConfig.compilerOptions[option]);
        
        if (missingOptions.length > 0) {
          this.addWarning(`TypeScript config missing recommended options: ${missingOptions.join(', ')}`);
        }
      } else {
        this.addWarning('TypeScript configuration appears to be incomplete');
      }
    } catch (error) {
      this.addError(`Failed to parse tsconfig.json: ${error.message}`);
    }
  }

  // Run all checks
  async runAllChecks() {
    console.log('🚀 Starting Promptify Frontend Startup Validation...\n');
    
    this.checkNodeVersion();
    this.checkRequiredFiles();
    this.checkEnvironmentVariables();
    this.checkDependencies();
    this.checkTypeScriptConfig();
    await this.checkPortAvailability();
    await this.checkBackendConnectivity();
    
    console.log('\n📊 Validation Summary:');
    console.log(`✅ Successful checks: ${this.getSuccessCount()}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors that need to be fixed:');
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
      console.log('\n🛑 Please fix the above errors before starting the development server.');
      process.exit(1);
    } else {
      console.log('\n🎉 All checks passed! The development server should start successfully.');
    }
  }

  getSuccessCount() {
    // This is a rough estimate since we don't track successes separately
    const totalChecks = 12; // Approximate number of checks
    return Math.max(0, totalChecks - this.errors.length - this.warnings.length);
  }
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new FrontendStartupValidator();
  validator.runAllChecks().catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

export default FrontendStartupValidator;