# Render Deployment Guide for Promptify

This guide will help you deploy your full-stack Promptify application to Render without any errors.

## Prerequisites

1. **GitHub Repository**: Ensure your code is pushed to a GitHub repository
2. **Render Account**: Create a free account at [render.com](https://render.com)
3. **MongoDB Atlas**: Set up a MongoDB database (recommended: [MongoDB Atlas](https://cloud.mongodb.com))
4. **API Keys**: Collect all your API keys (OpenAI, Anthropic, Perplexity, Razorpay, etc.)

## Step 1: Prepare Your Repository

1. Ensure the `render.yaml` file is in your root directory
2. Push all changes to your main branch:
```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

## Step 2: Connect to Render

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account if not already connected
4. Select your Promptify repository
5. Give your blueprint a name: `promptify-app`
6. Click **"Apply"**

## Step 3: Configure Environment Variables

### Backend Service Environment Variables

In the Render dashboard, go to your `promptify-backend` service and add these environment variables:

#### Required Variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/promptify?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key_here_make_it_long_and_random
ADMIN_PASSWORD=your_secure_admin_password
```

#### Payment Configuration:
```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret  
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

#### AI API Keys:
```
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
CATGPT_API_KEY=your_catgpt_api_key (if using)
```

### Frontend Service Environment Variables

In your `promptify-frontend` service, add:

```
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id (same as backend)
```

**Note**: The `VITE_API_URL` will be automatically set by Render using the backend service URL.

## Step 4: Deployment Process

1. **Automatic Deployment**: Both services will deploy automatically after environment variables are set
2. **Build Order**: Backend deploys first, then frontend (as configured in render.yaml)
3. **Health Checks**: Render will monitor your backend health via `/health` endpoint

## Step 5: Post-Deployment Verification

### Check Backend Service:
1. Visit your backend URL (e.g., `https://promptify-backend.onrender.com/health`)
2. Should return: `{"status":"OK","message":"Promptify API is running"}`

### Check Frontend Service:
1. Visit your frontend URL (e.g., `https://promptify-frontend.onrender.com`)
2. Verify the app loads correctly
3. Test user registration/login functionality
4. Check that API calls work properly

## Step 6: Custom Domain (Optional)

1. In Render dashboard, go to your frontend service
2. Click **"Settings"** → **"Custom Domains"**
3. Add your domain name
4. Follow DNS configuration instructions

## Troubleshooting Common Issues

### Backend Issues:

**Database Connection Failed:**
- Verify MongoDB URI is correct
- Ensure MongoDB Atlas allows connections from all IPs (0.0.0.0/0)
- Check MongoDB Atlas user permissions

**Environment Variables Missing:**
- Double-check all required variables are set in Render dashboard
- Ensure no typos in variable names
- Restart service after adding variables

**Build Failures:**
- Check build logs in Render dashboard
- Ensure package.json is correct
- Verify Node.js version compatibility

### Frontend Issues:

**API Connection Failed:**
- Verify VITE_API_URL is automatically set correctly
- Check browser network tab for failed requests
- Ensure CORS is properly configured in backend

**Build Failures:**
- Check if all dependencies are in package.json
- Verify Vite build command works locally
- Check for TypeScript errors

### Performance Optimization:

**Backend Optimization:**
- Enable compression middleware
- Implement proper caching strategies
- Use environment-specific logging levels

**Frontend Optimization:**
- Enable build optimization in Vite
- Implement code splitting for large bundles
- Use CDN for static assets if needed

## Production Environment Variables

Create a production `.env` file template:

### Backend .env (Production):
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password
```

## Scaling Considerations

### Free Tier Limitations:
- Backend: 512MB RAM, sleeps after 15 min inactivity
- Frontend: Unlimited bandwidth, global CDN
- Database: Use MongoDB Atlas free tier (512MB)

### Scaling Up:
- Upgrade to Render's paid plans for better performance
- Consider upgrading MongoDB Atlas for more storage
- Implement caching (Redis) for better performance

## Monitoring and Logs

### Backend Monitoring:
- Use Render's built-in logging
- Monitor response times and errors
- Set up alerts for service downtime

### Frontend Monitoring:
- Monitor Core Web Vitals
- Track user interactions and errors
- Use browser developer tools for debugging

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **CORS**: Configure specific origins for production
3. **Rate Limiting**: Already implemented in your backend
4. **HTTPS**: Automatic with Render's SSL certificates
5. **Database**: Use MongoDB Atlas with proper authentication

## Deployment Checklist

- [ ] Code pushed to GitHub main branch
- [ ] render.yaml file in root directory
- [ ] MongoDB Atlas database created and configured
- [ ] All environment variables set in Render dashboard
- [ ] Backend service deployed and health check passing
- [ ] Frontend service deployed and loading correctly
- [ ] API communication working between frontend and backend
- [ ] User authentication flow tested
- [ ] Payment integration tested (if applicable)
- [ ] Admin panel accessible
- [ ] Performance and error monitoring set up

## Support

If you encounter issues:
1. Check Render's deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check MongoDB Atlas connectivity
5. Review CORS configuration

## Updates and Maintenance

- **Automatic Deployments**: Enabled for main branch
- **Manual Deployments**: Available via Render dashboard
- **Rolling Updates**: Render handles zero-downtime deployments
- **Rollbacks**: Available through Render dashboard

Your Promptify application should now be successfully deployed on Render with proper error-free configuration!
