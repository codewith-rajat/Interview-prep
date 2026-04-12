# Setup & Quick Start Guide

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Backend setup
cd backend
npm install
# Create .env file with:
# PORT=5001
# MONGODB_URI=your_mongodb_uri
# JWT_SECRET=your_secret
# EMAIL_USER=your_email
# EMAIL_PASS=your_app_password

npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

Backend runs on `http://localhost:5001`
Frontend runs on `http://localhost:5173`

---

## 📋 Project Overview

### What is This Project?

**Interview Platform** - A full-stack application for booking and conducting mock interviews.

**Key Features:**
- ✅ User authentication (Login/Register)
- ✅ Role-based access (Interviewer/Interviewee)
- ✅ Interview booking system with availability slots
- ✅ Real-time video calls with HD quality
- ✅ AI-generated feedback reports
- ✅ Credit-based payment system
- ✅ Earnings dashboard & payout management
- ✅ Persistent chat during interviews
- ✅ Recording & playback

---

## 🏗️ Project Structure

```
Interview-Platform/
├── backend/
│   ├── models/
│   │   ├── User.js (User schema with credit system)
│   │   ├── InterviewSessions.js (Interview data)
│   │   ├── Availability.js (Interviewer availability)
│   │   └── Payout.js (Withdrawal requests)
│   │
│   ├── controllers/
│   │   ├── authController.js (Login/Register)
│   │   ├── payoutController.js (Withdrawal system)
│   │   ├── feedbackController.js (AI feedback)
│   │   └── [other controllers]
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── payoutRoutes.js
│   │   └── [other routes]
│   │
│   ├── middlewares/
│   │   ├── auth.js (JWT verification)
│   │   └── requireRole.js (Role-based access)
│   │
│   ├── app.js (Express app setup)
│   └── server.js (Entry point)
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── roles/interviewer/
    │   │   │   └── EarningsSection.jsx
    │   │   ├── FeedbackModal.jsx
    │   │   ├── FeedbackReport.jsx
    │   │   └── [other components]
    │   │
    │   ├── utils/
    │   │   ├── api.js (Axios setup)
    │   │   └── socket.js (WebSocket setup)
    │   │
    │   ├── App.jsx (Main component)
    │   └── main.jsx (Entry point)
    │
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## ✅ Implementation Status

### Backend
- ✅ User authentication system
- ✅ Interview booking & scheduling
- ✅ Availability management
- ✅ Payment/credit system
- ✅ Payout management
- ✅ Feedback generation
- ✅ All APIs implemented

### Frontend
- ✅ Tailwind CSS migration (removed CSS files)
- ✅ All components created with Tailwind
- ⏳ **UI redesign to Prept style** (In Progress)
  - Pending: Color scheme change (green → amber)
  - Pending: Dark theme application
  - Pending: Design pattern updates

---

## 🔧 Common Commands

### Backend
```bash
cd backend

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# View logs
npm run dev

# Stop server
Ctrl + C
```

### Frontend
```bash
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm lint
```

---

## 🐛 Troubleshooting

### Backend Issues

**Error: Port 5001 already in use**
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5001
kill -9 <PID>
```

**Error: Cannot find module**
```bash
npm install
```

**Error: .env not found**
Create `.env` file in backend folder with required variables

---

## 📱 Features by Role

### Interviewee
- Browse available interviewers
- Filter by category/expertise
- Book interview sessions
- Rate interviewer
- View AI feedback report
- Join video calls
- View booking history

### Interviewer
- Set availability slots
- Manage interview requests
- Conduct interviews
- Earn credits
- Withdraw earnings
- View analytics

---

## 💡 Key Technologies

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Nodemailer** - Email notifications

### Frontend
- **React 19.2.4** - UI framework
- **Vite 8.0.1** - Build tool
- **Tailwind CSS 4.2.2** - Styling
- **Axios 1.13.6** - HTTP client
- **React Router 7.13.1** - Routing
- **Socket.io** - Real-time features

---

## 🔐 Environment Variables

### Backend (.env)
```
PORT=5001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your_jwt_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
NEXT_PUBLIC_STREAM_API_KEY=stream_api_key
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5001
```

---

## 📞 Support

**Issue:** Backend won't start
- Check .env file exists
- Verify MongoDB connection
- Check port not in use

**Issue:** Frontend shows blank page
- Clear browser cache
- Check console for errors
- Verify backend is running

**Issue:** Login doesn't work
- Check JWT_SECRET in .env
- Verify database connection
- Check email service config

---

## 🎯 Next Steps

1. **Start Backend:** `npm run dev` in backend folder
2. **Start Frontend:** `npm run dev` in frontend folder
3. **Access App:** Open http://localhost:5173
4. **Register:** Create test account
5. **Explore:** Navigate through features

For detailed feature documentation, see **FEATURES.md**
For development guide, see **DEVELOPMENT.md**
