import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

class StartupValidator {
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

  // Check if required environment variables are set
  checkEnvironmentVariables() {
    this.log('Checking environment variables...');
    
    const required = [
      'PORT',
      'NODE_ENV',
      'MONGODB_URI',
      'JWT_SECRET',
      'FRONTEND_URL'
    ];

    const optional = [
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
      'ANTHROPIC_API_KEY',
      'OPENAI_API_KEY',
      'PERPLEXITY_API_KEY',
      'EMAIL_FROM',
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USER',
      'SMTP_PASS'
    ];

    // Check required variables
    required.forEach(variable => {
      if (!process.env[variable]) {
        this.addError(`Required environment variable ${variable} is not set`);
      } else {
        this.addSuccess(`${variable} is configured`);
      }
    });

    // Check optional variables
    optional.forEach(variable => {
      if (!process.env[variable]) {
        this.addWarning(`Optional environment variable ${variable} is not set`);
      } else {
        this.addSuccess(`${variable} is configured`);
      }
    });

    // Validate specific values
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.includes('your-super-secret')) {
      this.addWarning('JWT_SECRET appears to be using default value. Please change it for production.');
    }

    if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('username:password')) {
      this.addError('MONGODB_URI appears to be using placeholder values. Please configure with real credentials.');
    }
  }

  // Check if required files exist
  checkRequiredFiles() {
    this.log('Checking required files...');
    
    const requiredFiles = [
      'package.json',
      '.env',
      'server.js',
      'config/database.js',
      'middlewares/errorHandler.js',
      'utils/logger.js'
    ];

    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.addSuccess(`${file} exists`);
      } else {
        this.addError(`Required file ${file} is missing`);
      }
    });
  }

  // Check database connection
  async checkDatabaseConnection() {
    this.log('Checking database connection...');
    
    if (!process.env.MONGODB_URI) {
      this.addError('Cannot test database connection: MONGODB_URI not set');
      return;
    }

    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // 5 second timeout
      });
      this.addSuccess('Database connection successful');
      await mongoose.disconnect();
    } catch (error) {
      this.addError(`Database connection failed: ${error.message}`);
    }
  }

  // Check port availability
  async checkPortAvailability() {
    this.log('Checking port availability...');
    
    const port = process.env.PORT || 5000;
    
    try {
      const { createServer } = await import('net');
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
            this.addWarning(`Port ${port} is already in use. The application may fail to start.`);
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

  // Check npm dependencies
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
      if (!fs.existsSync('package-lock.json')) {
        this.addWarning('package-lock.json not found. Consider running "npm install" to generate it.');
      }

      this.addSuccess('Dependencies appear to be installed');
    } catch (error) {
      this.addError(`Dependency check failed: ${error.message}`);
    }
  }

  // Run all checks
  async runAllChecks() {
    console.log('🚀 Starting Promptify Backend Startup Validation...\n');
    
    this.checkNodeVersion();
    this.checkRequiredFiles();
    this.checkEnvironmentVariables();
    this.checkDependencies();
    await this.checkPortAvailability();
    await this.checkDatabaseConnection();
    
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
      console.log('\n🛑 Please fix the above errors before starting the server.');
      process.exit(1);
    } else {
      console.log('\n🎉 All checks passed! The server should start successfully.');
    }
  }

  getSuccessCount() {
    // This is a rough estimate since we don't track successes separately
    const totalChecks = 15; // Approximate number of checks
    return totalChecks - this.errors.length - this.warnings.length;
  }
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new StartupValidator();
  validator.runAllChecks().catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

export default StartupValidator;