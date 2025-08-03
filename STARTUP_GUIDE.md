# 🚀 Promptify Startup Guide

This guide will help you get the Promptify application running perfectly on both backend and frontend terminals.

## 🎯 Quick Start (Recommended)

### Option 1: PowerShell (Recommended for Windows)
```powershell
# Run the master startup script
.\start-project.ps1
# Choose option 3 to start both backend and frontend
```

### Option 2: Command Prompt (Windows)
```cmd
# Run the master startup script
start-project.bat
# Choose option 3 to start both backend and frontend
```

### Option 3: Manual Startup
```powershell
# Terminal 1 - Backend
cd backend
.\start-backend.ps1

# Terminal 2 - Frontend (in a new terminal)
cd frontend
.\start-frontend.ps1
```

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ **Node.js v16+** installed ([Download](https://nodejs.org/))
- ✅ **Git** installed ([Download](https://git-scm.com/))
- ✅ **MongoDB** connection (Atlas or local)
- ✅ **Internet connection** for package installation

## 🔧 Configuration Setup

### 1. Backend Configuration

The backend `.env` file should contain:

```env
# Required
PORT=8001
NODE_ENV=development
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:8080

# Optional (for full functionality)
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
PERPLEXITY_API_KEY=your-perplexity-key
```

### 2. Frontend Configuration

The frontend `.env` file should contain:

```env
VITE_API_URL=http://localhost:8001/api
VITE_APP_NAME=Promptify
VITE_APP_VERSION=1.0.0
```

## 🚨 Troubleshooting Common Issues

### Issue 1: "Node.js not found"
**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart your terminal
3. Verify with `node --version`

### Issue 2: "Port already in use"
**Solution:**
- Backend (8001): Change `PORT` in `backend/.env`
- Frontend (8080): Vite will auto-select next available port

### Issue 3: "Database connection failed"
**Solution:**
1. Check your `MONGODB_URI` in `backend/.env`
2. Ensure MongoDB Atlas cluster is running
3. Verify network connectivity
4. The server will still start without DB (with limited functionality)

### Issue 4: "Dependencies not installed"
**Solution:**
```powershell
# Install all dependencies
.\start-project.ps1
# Choose option 4
```

### Issue 5: "Permission denied" (PowerShell)
**Solution:**
```powershell
# Enable script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📊 Startup Validation

Both backend and frontend include automatic validation that checks:

### Backend Validation
- ✅ Node.js version compatibility
- ✅ Required files existence
- ✅ Environment variables configuration
- ✅ Dependencies installation
- ✅ Port availability
- ✅ Database connectivity

### Frontend Validation
- ✅ Node.js version compatibility
- ✅ Required files existence
- ✅ Environment variables configuration
- ✅ Dependencies installation
- ✅ TypeScript configuration
- ✅ Port availability
- ✅ Backend API connectivity

## 🎉 Success Indicators

### Backend Started Successfully
```
✅ Database connection established successfully
🚀 Promptify API server running on port 8001
📊 Environment: development
🌐 Frontend URL: http://localhost:8080
```

### Frontend Started Successfully
```
  VITE v5.4.1  ready in 1234 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## 🌐 Access Points

Once both services are running:

- **Frontend Application**: http://localhost:8080
- **Backend API**: http://localhost:8001
- **API Health Check**: http://localhost:8001/health
- **API Documentation**: http://localhost:8001/api (if available)

## 🔄 Development Workflow

1. **Start both services** using the startup scripts
2. **Make changes** to your code
3. **Auto-reload** happens automatically:
   - Backend: nodemon restarts server
   - Frontend: Vite hot module replacement
4. **Test changes** in browser at http://localhost:8080

## 🛑 Stopping the Services

- **Individual terminals**: Press `Ctrl+C`
- **All services**: Close all terminal windows
- **Graceful shutdown**: The backend handles graceful shutdown automatically

## 📝 Additional Commands

### Backend Commands
```bash
cd backend
npm run dev          # Start with nodemon
npm run dev:check    # Start with validation
npm run validate     # Run validation only
npm start           # Production start
```

### Frontend Commands
```bash
cd frontend
npm run dev          # Start development server
npm run dev:check    # Start with validation
npm run validate     # Run validation only
npm run build       # Build for production
npm run preview     # Preview production build
```

## 🆘 Getting Help

If you encounter issues:

1. **Check the validation output** for specific error messages
2. **Review the terminal logs** for detailed error information
3. **Verify your configuration** against this guide
4. **Ensure all prerequisites** are properly installed
5. **Try the manual installation** steps if automated scripts fail

## 🎯 Pro Tips

- **Use PowerShell scripts** for better Windows compatibility
- **Keep terminals open** to monitor logs and errors
- **Check the health endpoint** to verify backend is running
- **Use browser dev tools** to debug frontend issues
- **Monitor both terminal outputs** for real-time feedback

---

**Happy coding! 🚀**