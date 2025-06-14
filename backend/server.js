const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');           // 🆕 NEW AUTH ROUTES
const onboardingRoutes = require('./routes/onboarding'); // 🆕 NEW ONBOARDING ROUTES
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/api', (req, res) => {
  res.json({
    message: 'RoomieMatch API v2.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users', 
      onboarding: '/api/onboarding',
      preview: '/api/preview'
    },
    health: '/health'
  });
});

// ✅ ADD THESE TWO LINES HERE:
app.set('trust proxy', 1); // Trust Railway's proxy for rate limiting
app.get('/favicon.ico', (req, res) => res.status(204).end()); // Handle favicon requests

// Security and Performance Middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
// 🆕 SEPARATE RATE LIMITING FOR AUTH (more restrictive)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit auth attempts
  message: {
    error: 'Too many authentication attempts, please try again later.'
  }
});
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter); // 🆕 Stricter limits for auth

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://gary136.github.io', 'https://roommate-finder-backend-production.up.railway.app']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Database connection
const connectDB = async () => {
    try {
      const mongoURI = process.env.MONGODB_URI;
      
      if (!mongoURI) {
        throw new Error('MONGODB_URI environment variable is not defined');
      }
      
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // Atlas-specific optimizations
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      console.log('✅ MongoDB Atlas connected successfully');
      console.log(`📊 Database: ${mongoose.connection.name}`);
      
    } catch (error) {
      console.error('❌ MongoDB Atlas connection error:', error.message);
      process.exit(1);
    }
  };

// Connect to database
connectDB();

// Health check endpoint
app.get('/health', (req, res) => {
  const healthInfo = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: process.env.npm_package_version || '1.0.0',
    // 🆕 ADD INFO ABOUT NEW ENDPOINTS
    endpoints: {
      auth: '/api/auth',
      onboarding: '/api/onboarding',
      users: '/api/users'
    }
  };
  
  res.status(200).json(healthInfo);
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);            // 🆕 NEW AUTH ROUTES
app.use('/api/onboarding', onboardingRoutes); // 🆕 NEW ONBOARDING ROUTES

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'RoomieMatch API Server',
    version: '2.0.0', // 🆕 Updated version
    endpoints: {
      // 🆕 NEW ENDPOINTS
      'POST /api/auth/quick-signup': 'Quick user registration with minimal fields',
      'POST /api/auth/login': 'User authentication',
      'GET /api/auth/onboarding-status': 'Get user onboarding progress',
      'POST /api/auth/onboarding/housing': 'Update housing preferences',
      'POST /api/auth/onboarding/lifestyle': 'Update lifestyle preferences', 
      'POST /api/auth/onboarding/professional': 'Update professional info',
      'POST /api/auth/onboarding/complete': 'Complete onboarding process',
      'GET /api/auth/me': 'Get current user profile',
      // ONBOARDING ENDPOINTS
      'PUT /api/onboarding/update': 'Flexible onboarding step update',
      'GET /api/onboarding/progress': 'Detailed progress tracking',
      'POST /api/onboarding/skip/:stepNumber': 'Skip onboarding step',
      // EXISTING ENDPOINTS
      '/api/users': 'User management (existing routes)',
      '/health': 'Server health check'
    },
    docs: '/api/docs',
    health: '/health'
  });
});

const previewRoutes = require('./routes/preview');
app.use('/api/preview', previewRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🌐 API available at: http://localhost:${PORT}`);
  
  // 🆕 LOG NEW ENDPOINTS
  console.log(`\n📍 New API Endpoints:`);
  console.log(`   🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   📝 Onboarding: http://localhost:${PORT}/api/onboarding`);
  console.log(`   👥 Users: http://localhost:${PORT}/api/users`);
  console.log(`   ❤️  Health: http://localhost:${PORT}/health`);
  
  // 🆕 QUICK TEST COMMAND
  console.log(`\n🧪 Quick Test Command:`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/auth/quick-signup \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"username":"test","email":"test@example.com","password":"password123","firstName":"Test","lastName":"User","sex":"female"}'`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;