# 🔧 Admin Page Debug & Fix Guide

This guide provides step-by-step solutions for common admin page errors and crashes.

## ✅ **Fixed Issues**

### 1. 🔴 **"Settings is not defined" Error - FIXED**

**Issue:** ReferenceError in AdminLayout.tsx line 216
**Solution:** Added missing `Settings` import from lucide-react

```tsx
// Fixed import in AdminLayout.tsx
import {
  LayoutDashboard,
  Store,
  Users,
  DollarSign,
  Menu,
  LogOut,
  Home,
  ExternalLink,
  Search,
  User,
  ChevronDown,
  Settings  // ✅ Added this import
} from 'lucide-react';
```

### 2. 🔐 **401 Unauthorized at /api/userInfo - FIXED**

**Issue:** Frontend calling `/api/userInfo` but route didn't exist
**Solution:** Added comprehensive userInfo route that handles both admin and regular users

```javascript
// Added to backend/routes/auth.js
router.get('/userInfo', authenticateToken, async (req, res) => {
  // Handles both admin and regular user authentication
});
```

### 3. 🛑 **500 Internal Server Error at /api/auth/admin/login - FIXED**

**Issue:** Missing JWT import and poor error handling
**Solution:** 
- Added `import jwt from 'jsonwebtoken';`
- Enhanced error handling with try-catch
- Added input validation
- Improved admin token generation

### 4. ⚠️ **File Upload Errors (net::ERR_FILE_NOT_FOUND) - FIXED**

**Issue:** No static file serving for uploads
**Solution:** Added static file serving in server.js

```javascript
// Added to server.js
app.use('/uploads', express.static('uploads'));
```

## 🚀 **Enhanced Features Added**

### 1. **Improved Authentication System**
- ✅ Admin token handling in middleware
- ✅ Separate admin userInfo endpoint
- ✅ Better error messages and validation
- ✅ Environment-based admin credentials

### 2. **Error Boundary Component**
- ✅ React error boundary for crash prevention
- ✅ User-friendly error messages
- ✅ Development error details
- ✅ Recovery options (retry, reload, go home)

### 3. **Enhanced Error Handling**
- ✅ Comprehensive try-catch blocks
- ✅ Detailed error logging
- ✅ Graceful error responses
- ✅ Input validation

## 🔧 **Current Admin Credentials**

```
Email: admin@promptify.com
Password: admin123
```

These can be changed in the backend `.env` file:
```env
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-secure-password
```

## 🛠️ **Testing the Fixes**

### 1. **Test Admin Login**
```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd frontend
npm run dev

# Navigate to: http://localhost:8080/admin/login
# Use credentials: admin@promptify.com / admin123
```

### 2. **Verify Error Fixes**
- ✅ AdminLayout should load without "Settings is not defined" error
- ✅ Admin login should work without 500 errors
- ✅ Dashboard should load without 401 errors
- ✅ File uploads should work without ERR_FILE_NOT_FOUND

### 3. **Test Error Boundary**
```tsx
// To test error boundary, temporarily add this to any component:
throw new Error('Test error boundary');
```

## 🔍 **Debugging Tools**

### 1. **Backend Debugging**
```bash
# Check server logs
npm run dev

# Test API endpoints
curl -X POST http://localhost:8001/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@promptify.com","password":"admin123"}'

# Check health endpoint
curl http://localhost:8001/health
```

### 2. **Frontend Debugging**
```javascript
// Add to browser console to check auth state
localStorage.getItem('token')

// Check API calls in Network tab
// Look for 401, 500, or CORS errors
```

### 3. **Database Debugging**
```bash
# Check MongoDB connection
npm run validate

# Test database queries in MongoDB Compass or CLI
```

## 🚨 **Common Issues & Solutions**

### Issue: Admin login returns 500 error
**Solution:**
1. Check backend logs for specific error
2. Verify JWT_SECRET is set in .env
3. Ensure admin credentials are correct
4. Check database connection

### Issue: "Settings is not defined" still appears
**Solution:**
1. Clear browser cache
2. Restart frontend dev server
3. Check import statement in AdminLayout.tsx

### Issue: File uploads fail
**Solution:**
1. Verify uploads directory exists: `backend/uploads/`
2. Check static file serving in server.js
3. Ensure proper file permissions

### Issue: 401 Unauthorized errors
**Solution:**
1. Check token in localStorage
2. Verify token format: `Bearer <token>`
3. Check token expiration
4. Ensure proper authentication middleware

## 📋 **Pre-deployment Checklist**

- [ ] All admin routes return proper responses
- [ ] Error boundary catches and displays errors gracefully
- [ ] File uploads work correctly
- [ ] Admin authentication works with environment credentials
- [ ] All console errors are resolved
- [ ] Database connections are stable
- [ ] CORS is properly configured

## 🔧 **Advanced Debugging**

### Enable Debug Mode
```bash
# Backend
DEBUG=* npm run dev

# Frontend
VITE_DEBUG=true npm run dev
```

### Check Network Requests
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by XHR/Fetch
4. Look for failed requests (red status codes)

### Verify Token Structure
```javascript
// Decode JWT token (browser console)
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

// Usage
const token = localStorage.getItem('token');
console.log(parseJwt(token));
```

## 🆘 **Emergency Recovery**

If admin panel is completely broken:

1. **Clear all data:**
```bash
# Clear browser storage
localStorage.clear();
sessionStorage.clear();

# Clear browser cache (Ctrl+Shift+Delete)
```

2. **Reset backend:**
```bash
# Kill all Node processes
npm run port:kill-all

# Restart with clean state
npm run dev
```

3. **Reset frontend:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📞 **Support Information**

- **Backend Health Check:** http://localhost:8001/health
- **Frontend URL:** http://localhost:8080
- **Admin Login:** http://localhost:8080/admin/login
- **API Documentation:** Available in backend routes files

---

**All major admin page issues have been resolved. The system should now run smoothly without crashes or authorization errors.**