# Quick Start Guide

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Configure Environment

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/placement_portal
JWT_SECRET=mySecretKey123
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

NODE_ENV=development
```

## Step 3: Start MongoDB

Make sure MongoDB is running on your system:
```bash
# Windows (if MongoDB service is installed)
net start MongoDB

# Or run mongod manually
mongod
```

## Step 4: Run the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5000

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:3000

## Step 5: Create Admin Account

Use MongoDB Compass or mongosh:

```javascript
use placement_portal

db.users.insertOne({
  name: "Admin",
  email: "admin@college.edu",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5yvQqVLq9Lg6i", // password: admin123
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Default Admin Login:
- Email: admin@college.edu
- Password: admin123

## Troubleshooting

### "Cannot find module" error
Make sure you're in the correct directory:
```bash
# Check current directory
pwd  # or cd (on Windows)

# Should be in backend folder when running backend
cd c:\Users\nitin\Documents\portal\backend
```

### Port already in use
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in .env file
PORT=5001
```

### MongoDB connection error
- Ensure MongoDB is running
- Check MONGO_URI in .env
- Try: mongodb://127.0.0.1:27017/placement_portal

## Project Structure

