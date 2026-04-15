# Render Deployment Guide

## Backend Deployment (Node.js)

### Step 1: Create a Render Service
1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repository

### Step 2: Configure Backend Service
- **Name**: interview-platform-api (or any name)
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm run dev` or `node server.js`
- **Region**: Choose closest to you

### Step 3: Add Environment Variables
Go to Environment tab and add:
```
PORT=5000
MONGO_URI=mongodb+srv://rajatagrawal021_db_user:9bgjrM4jLEDTgnge@cluster0.qhjtcxq.mongodb.net/?appName=Cluster0
JWT_SECRET=123456789abcdefghijklmnopqrtsucnvmsjksjck
NODE_ENV=production
```

### Step 4: Note Your Backend URL
After deployment, you'll get a URL like: `https://interview-platform-api.onrender.com`

---

## Frontend Deployment (Vite/React)

### Step 1: Create Another Render Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository

### Step 2: Configure Frontend Service
- **Name**: interview-platform-web (or any name)
- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview` or use Node.js with static hosting
- **Region**: Same as backend

### Step 3: Add Environment Variables
Go to Environment tab and add:
```
VITE_API_URL=https://interview-platform-api.onrender.com/api
VITE_SOCKET_URL=https://interview-platform-api.onrender.com
```

Replace `interview-platform-api` with your actual backend service name.

### Step 4: Alternative - Use Render Static Site
For better frontend hosting:
1. Build locally: `npm run build`
2. Use Render Static Site for frontend
3. Point to `/frontend/dist` folder

---

## Important: CORS Configuration

If you get CORS errors, update `backend/server.js`:

```javascript
const io = new Server(server, {
  cors: {
    origin: "https://your-frontend-url.onrender.com",
    credentials: true
  }
});
```

---

## Testing

After deployment:

1. **Check backend is running**: `https://your-backend-url.onrender.com/api/user/me`
2. **Check frontend loads**: `https://your-frontend-url.onrender.com`
3. **Test WebSocket**: Open DevTools → Look for Socket.io connection in Network tab

---

## Files Changed for Deployment

✅ `backend/.env` - Updated PORT configuration
✅ `backend/server.js` - Now reads PORT from environment
✅ `frontend/src/components/utils/api.js` - Uses VITE_API_URL
✅ `frontend/src/components/utils/socket.js` - Uses VITE_SOCKET_URL
✅ `frontend/.env.local` - Local development URLs
✅ `frontend/.env.production` - Production URLs

---

## Quick Checklist

- [ ] Backend deployed on Render with environment variables set
- [ ] Backend URL noted (e.g., `https://xxx.onrender.com`)
- [ ] Frontend environment variables updated with backend URL
- [ ] Frontend deployed on Render
- [ ] CORS configured if needed
- [ ] Test full flow: Login → Dashboard → Join call
