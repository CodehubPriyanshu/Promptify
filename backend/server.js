import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'net';
import connectDB from './config/database.js';
import { globalErrorHandler, gracefulShutdown } from './middlewares/errorHandler.js';
import logger from './utils/logger.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import marketplaceRoutes from './routes/marketplace.js';
import playgroundRoutes from './routes/playground.js';
import paymentRoutes from './routes/payment.js';

// Load environment variables
dotenv.config();

// Validate critical environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Function to check if port is available
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
};

// Function to find available port
const findAvailablePort = async (startPort) => {
  let port = startPort;
  while (port < startPort + 100) { // Check up to 100 ports
    if (await isPortAvailable(port)) {
      return port;
    }
    port++;
  }
  throw new Error(`No available port found starting from ${startPort}`);
};

const app = express();
const PREFERRED_PORT = parseInt(process.env.PORT) || 8001;

// Connect to MongoDB with error handling
connectDB()
  .then(() => {
    logger.info('✅ Database connection established successfully');
  })
  .catch((error) => {
    logger.error('❌ Failed to connect to database:', error.message);
    console.error('Database connection failed. Please check your MONGODB_URI and network connection.');
    process.exit(1);
  });

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration - Allow multiple frontend origins for development and production
const allowedOrigins = [
  'http://localhost:3000',   // Original frontend port
  'http://localhost:5173',   // Vite default port
  'http://localhost:8080',   // Alternative Vite port
  'http://localhost:8081',   // Current frontend port
  'http://localhost:5001',   // Backend port (for testing)
  process.env.FRONTEND_URL,  // Environment variable (Render production)
  // Add common Render subdomains patterns
  ...(process.env.FRONTEND_URL ? [
    process.env.FRONTEND_URL.replace('http://', 'https://'),  // Ensure HTTPS variant
    process.env.FRONTEND_URL.replace('https://', 'http://')   // Ensure HTTP variant
  ] : [])
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Request logging middleware
app.use(logger.requestLogger());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Promptify API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/playground', playgroundRoutes);
app.use('/api/payment', paymentRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found' 
  });
});

// Global error handler (must be last middleware)
app.use(globalErrorHandler);

// Start server with port conflict handling
const startServer = async () => {
  try {
    let PORT = PREFERRED_PORT;
    
    // Check if preferred port is available
    if (!(await isPortAvailable(PREFERRED_PORT))) {
      console.warn(`⚠️  Port ${PREFERRED_PORT} is already in use`);
      console.log('🔍 Searching for available port...');
      
      try {
        PORT = await findAvailablePort(PREFERRED_PORT);
        console.log(`✅ Found available port: ${PORT}`);
        
        if (PORT !== PREFERRED_PORT) {
          console.log(`📝 Note: Update your frontend .env file to use: VITE_API_URL=http://localhost:${PORT}/api`);
        }
      } catch (error) {
        console.error('��� Could not find available port:', error.message);
        console.log('💡 Try killing existing Node.js processes: taskkill /F /IM node.exe');
        process.exit(1);
      }
    }

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Promptify API server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
      
      if (PORT !== PREFERRED_PORT) {
        logger.warn(`⚠️  Using port ${PORT} instead of preferred port ${PREFERRED_PORT}`);
      }
    });

    // Handle server startup errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is still in use. Trying to find another port...`);
        startServer(); // Retry with a different port
      } else {
        console.error('❌ Server startup error:', error.message);
        process.exit(1);
      }
    });

    // Setup graceful shutdown
    gracefulShutdown(server);
    
    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
