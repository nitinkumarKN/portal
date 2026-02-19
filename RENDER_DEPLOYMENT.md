# Render Deployment Guide

## Backend Deployment (https://portalback-dsr4.onrender.com)

### Environment Variables to Set in Render Dashboard:
Go to your backend service → Environment → Add the following:

```
PORT=5000
MONGO_URI=mongodb+srv://nitinrajp:nitinrajpu@cluster0.z8ycvik.mongodb.net/?appName=Cluster0
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
FRONTEND_URL=https://portaluse.onrender.com
NODE_ENV=production

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Build & Start Commands:
- **Build Command:** `npm install`
- **Start Command:** `npm start` or `node server.js`

---

## Frontend Deployment (https://portaluse.onrender.com)

### Environment Variables to Set in Render Dashboard:
Go to your frontend service → Environment → Add the following:

```
VITE_API_URL=https://portalback-dsr4.onrender.com
VITE_API_BASE_URL=/api
VITE_APP_NAME=Smart Placement Portal
VITE_APP_VERSION=1.0.0
NODE_ENV=production
```

### Build & Start Commands:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx serve -s dist -l 3000`

### Additional Frontend Settings:
- Make sure the `public/_redirects` file exists (for React Router to work)
- Ensure the service is set to serve a "Static Site" (or use a web service with the serve command above)

---

## Important Notes:

1. **CORS Configuration:** Already configured in backend/app.js to accept requests from FRONTEND_URL
2. **After Setting Environment Variables:** You must redeploy both services
3. **Deploy Order:** Deploy backend first, then frontend
4. **.env files:** Are gitignored and won't be deployed (use Render's environment variables instead)

---

## Troubleshooting 404 Errors:

If you're still getting 404 errors:

1. **Check Backend Logs** on Render to ensure the server is running
2. **Verify Environment Variables** are set correctly in Render dashboard
3. **Test Backend API** directly: `https://portalback-dsr4.onrender.com/api/auth/me`
4. **Check Browser Console** for the actual API URLs being called
5. **Redeploy** after setting environment variables

---

## Testing Deployment:

After deployment, test these endpoints:
- Backend Health: https://portalback-dsr4.onrender.com/
- Frontend: https://portaluse.onrender.com/
- Admin Login: https://portaluse.onrender.com/admin-login
