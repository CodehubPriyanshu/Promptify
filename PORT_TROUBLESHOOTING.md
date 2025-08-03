# 🔧 Port Conflict Troubleshooting Guide

This guide helps you resolve the `EADDRINUSE` error when port 8001 (or any port) is already in use.

## 🚨 Quick Fix Commands

### Immediate Solutions

```bash
# Kill all Node.js processes (Windows)
taskkill /F /IM node.exe

# Kill all Node.js processes (macOS/Linux)
pkill -f node
```

### Using NPM Scripts (Recommended)

```bash
cd backend

# Check what's using port 8001
npm run port:check

# Kill processes using port 8001
npm run port:kill

# Kill all Node.js processes
npm run port:kill-all

# Start server after cleaning port
npm run dev:clean

# Find next available port
npm run port:find
```

## 🔍 Manual Port Investigation

### Windows Commands

```cmd
# Find what's using port 8001
netstat -ano | findstr :8001

# Kill specific process by PID
taskkill /PID <PID> /F

# List all Node.js processes
tasklist | findstr node.exe
```

### macOS/Linux Commands

```bash
# Find what's using port 8001
lsof -i :8001

# Kill specific process by PID
kill -9 <PID>

# Find all Node.js processes
ps aux | grep node
```

## 🛠️ Automated Solutions

### 1. Enhanced Startup Scripts

Use the enhanced startup scripts that automatically handle port conflicts:

```bash
# Windows
start-backend-enhanced.bat

# PowerShell
.\start-backend-enhanced.ps1
```

### 2. Server Auto-Port Detection

The backend server now automatically:
- ✅ Checks if port 8001 is available
- ✅ Finds next available port if 8001 is busy
- ✅ Updates CORS configuration automatically
- ✅ Provides clear instructions for frontend updates

## 🔄 Port Management Workflow

### Step 1: Identify the Problem
```bash
npm run port:check
```

### Step 2: Resolve Port Conflict
```bash
# Option A: Kill specific port
npm run port:kill

# Option B: Kill all Node processes
npm run port:kill-all

# Option C: Let server auto-select port
npm run dev
```

### Step 3: Update Frontend (if needed)
If the backend starts on a different port, update frontend `.env`:
```env
VITE_API_URL=http://localhost:<NEW_PORT>/api
```

## 🎯 Prevention Strategies

### 1. Proper Shutdown
Always stop servers with `Ctrl+C` instead of closing terminals abruptly.

### 2. Use Process Managers
Consider using PM2 for production:
```bash
npm install -g pm2
pm2 start server.js --name promptify-backend
pm2 stop promptify-backend
```

### 3. Environment-Specific Ports
Use different ports for different environments:
```env
# Development
PORT=8001

# Staging
PORT=8002

# Production
PORT=8000
```

## 🚨 Common Error Scenarios

### Scenario 1: Previous Server Still Running
**Error:** `EADDRINUSE: address already in use :::8001`

**Solution:**
```bash
npm run port:kill-all
npm run dev
```

### Scenario 2: Multiple Development Instances
**Error:** Multiple terminals running the same server

**Solution:**
```bash
# Check all Node processes
tasklist | findstr node.exe

# Kill all and restart
npm run dev:clean
```

### Scenario 3: System Service Using Port
**Error:** System service occupying the port

**Solution:**
```bash
# Find available port
npm run port:find

# Or change default port in .env
PORT=8002
```

## 🔧 Advanced Troubleshooting

### Check Port Usage History
```bash
# Windows - Check recent port usage
netstat -ano | findstr :800

# Find processes by name
wmic process where "name='node.exe'" get processid,commandline
```

### Force Kill Stubborn Processes
```bash
# Windows - Force kill by image name
taskkill /F /IM node.exe /T

# Windows - Force kill by port (requires admin)
for /f "tokens=5" %a in ('netstat -aon ^| findstr :8001') do taskkill /f /pid %a
```

### Verify Port is Free
```bash
# Test port availability
telnet localhost 8001

# Or use PowerShell
Test-NetConnection -ComputerName localhost -Port 8001
```

## 📋 Troubleshooting Checklist

- [ ] Checked what's using port 8001
- [ ] Killed conflicting processes
- [ ] Verified port is now available
- [ ] Updated frontend configuration if needed
- [ ] Tested server startup
- [ ] Verified API endpoints are accessible

## 🆘 Emergency Recovery

If nothing works, try this complete reset:

```bash
# 1. Kill everything
taskkill /F /IM node.exe
taskkill /F /IM nodemon.exe

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

# 4. Start fresh
npm run dev
```

## 💡 Pro Tips

1. **Use the enhanced startup scripts** - they handle most issues automatically
2. **Monitor your processes** - don't leave development servers running
3. **Use different ports** for different projects
4. **Set up aliases** for common commands:
   ```bash
   # Add to your shell profile
   alias kill-node="taskkill /F /IM node.exe"
   alias check-port="netstat -ano | findstr"
   ```

## 🔗 Related Commands Reference

```bash
# Backend port management
npm run port:check      # Check port 8001
npm run port:kill       # Kill processes on port 8001
npm run port:kill-all   # Kill all Node.js processes
npm run port:find       # Find available port
npm run dev:clean       # Clean port and start server

# Manual commands
netstat -ano | findstr :8001    # Windows port check
taskkill /PID <PID> /F          # Windows kill process
lsof -i :8001                   # macOS/Linux port check
kill -9 <PID>                   # macOS/Linux kill process
```

---

**Remember:** The enhanced server now handles most port conflicts automatically. If you're still having issues, the problem might be elsewhere in your configuration.