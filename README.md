# Promptify - Generative Prompt Studio

A full-stack AI prompt creation and management platform built with React, TypeScript, Node.js, and MongoDB.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - Either local installation or MongoDB Atlas account
- **Git** - [Download here](https://git-scm.com/)

### 🎯 Easy Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd generative-prompt-studio
   ```

2. **Run the project**
   
   **Option A: Use the master startup script**
   ```bash
   # Double-click start-project.bat or run in terminal:
   start-project.bat
   ```
   
   **Option B: Start both services manually**
   ```bash
   # In one terminal (Backend):
   cd backend
   start-backend.bat
   
   # In another terminal (Frontend):
   cd frontend
   start-frontend.bat
   ```

3. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8001
   - Health Check: http://localhost:8001/health

## 📁 Project Structure

```
generative-prompt-studio/
├── backend/                 # Node.js Express API
│   ├── config/             # Database and app configuration
│   ├── middlewares/        # Express middlewares
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── scripts/            # Utility scripts
│   ├── services/           # Business logic
│   ├── utils/              # Helper utilities
│   ├── .env                # Environment variables
│   ├── server.js           # Main server file
│   └── start-backend.bat   # Backend startup script
├── frontend/               # React TypeScript app
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   ├── scripts/            # Utility scripts
│   ├── .env                # Environment variables
│   ├── vite.config.ts      # Vite configuration
│   └── start-frontend.bat  # Frontend startup script
├── start-project.bat       # Master startup script
└── README.md              # This file
```

## ⚙️ Configuration

### Backend Configuration (.env)

The backend uses the following environment variables:

```env
# Server Configuration
PORT=8001
NODE_ENV=development

# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:8080

# API Keys (Optional)
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key

# Payment Configuration (Optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend Configuration (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:8001/api

# App Configuration
VITE_APP_NAME=Promptify
VITE_APP_VERSION=1.0.0
```

## 🛠️ Manual Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Copy example environment file
   copy .env.example .env
   # Edit .env with your configuration
   ```

4. **Run validation and start server**
   ```bash
   # Validate configuration
   npm run validate
   
   # Start development server
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Create .env file with API URL
   echo VITE_API_URL=http://localhost:8001/api > .env
   ```

4. **Run validation and start development server**
   ```bash
   # Validate configuration
   npm run validate
   
   # Start development server
   npm run dev
   ```

## 🔧 Available Scripts

### Backend Scripts

- `npm run dev` - Start development server with nodemon
- `npm run dev:check` - Run validation then start development server
- `npm run validate` - Run startup validation checks
- `npm start` - Start production server
- `npm run build` - No build step required (Node.js)

### Frontend Scripts

- `npm run dev` - Start Vite development server
- `npm run dev:check` - Run validation then start development server
- `npm run validate` - Run startup validation checks
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use (EADDRINUSE error)**
   
   **Quick Fix:**
   ```bash
   cd backend
   npm run port:kill-all    # Kill all Node.js processes
   npm run dev              # Restart server
   ```
   
   **Advanced Solutions:**
   ```bash
   npm run port:check       # Check what's using port 8001
   npm run port:kill        # Kill processes on port 8001
   npm run dev:clean        # Clean port and start server
   ```
   
   The backend now automatically finds available ports if 8001 is busy.

2. **Database connection failed**
   - Check your `MONGODB_URI` in backend/.env
   - Ensure MongoDB is running (if using local installation)
   - Verify network connectivity to MongoDB Atlas (if using cloud)
   - The server will continue running without DB (limited functionality)

3. **Dependencies not installed**
   - Run `npm install` in both backend and frontend directories
   - Delete `node_modules` and `package-lock.json`, then reinstall
   - Use the startup scripts which auto-install dependencies

4. **Environment variables not loaded**
   - Ensure `.env` files exist in both directories
   - Check for typos in variable names
   - Restart the servers after changing .env files
   - Use the startup scripts which auto-create .env files

### Validation Errors

Both backend and frontend include startup validation scripts that check:

- Node.js version compatibility
- Required files existence
- Environment variable configuration
- Dependencies installation
- Port availability
- Database connectivity (backend)
- API connectivity (frontend)

Run validation manually:
```bash
# Backend validation
cd backend && npm run validate

# Frontend validation
cd frontend && npm run validate
```

## 🔍 Health Checks

### Backend Health Check
```bash
curl http://localhost:8001/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Promptify API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Frontend Health Check
- Open http://localhost:8080 in your browser
- The application should load without errors

## 📝 Development Workflow

1. **Start both services**
   ```bash
   # Use the master script
   start-project.bat
   # Choose option 3 to start both
   ```

2. **Make changes**
   - Backend changes trigger automatic restart (nodemon)
   - Frontend changes trigger hot reload (Vite HMR)

3. **Test your changes**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8001/api

4. **Check logs**
   - Backend logs appear in the backend terminal
   - Frontend logs appear in browser console and frontend terminal

## 🚀 Production Deployment

### Backend Production

1. **Set production environment**
   ```env
   NODE_ENV=production
   ```

2. **Use production database**
   ```env
   MONGODB_URI=your_production_mongodb_uri
   ```

3. **Start production server**
   ```bash
   npm start
   ```

### Frontend Production

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Serve built files**
   ```bash
   npm run preview
   # Or use a static file server
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check this README for troubleshooting steps
2. Run the validation scripts to identify configuration issues
3. Check the console/terminal logs for error messages
4. Ensure all prerequisites are properly installed

---

**Happy coding! 🎉**