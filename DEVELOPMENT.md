# Development Guide

## 🎨 Frontend UI Redesign (Prept Style)

### Design System Overview

Your UI needs to be redesigned to match Prept (piyush-eon/ai-interview-platform).

**Key Differences:**

| Aspect | Current | Target (Prept) |
|--------|---------|-----------------|
| **Background** | White | Black (#000000) |
| **Accent Color** | Emerald Green | Amber Gold (#fbbf24) |
| **Theme** | Light | Dark |
| **Cards** | Light backgrounds | Dark (#0f0f11) |
| **Text Colors** | Slate | Stone palette |

### Color Palette (Prept)

```
PRIMARY COLORS:
- Background: #000000 (black)
- Card Background: #0f0f11 (dark gray)
- Primary Accent: #fbbf24 (amber-400)
- Hover State: border-amber-400/20

TEXT COLORS:
- Primary: text-stone-100 (white)
- Secondary: text-stone-400
- Tertiary: text-stone-600

BORDERS:
- Default: border-white/10
- Hover: border-amber-400/20
```

### Components to Update

#### 1. EarningsSection.jsx
- Change: emerald → amber colors
- Change: white background → bg-[#0f0f11]
- Add: Dark borders, hover effects

**Before:**
```jsx
<div className="bg-gradient-to-r from-emerald-500 to-emerald-600">
```

**After:**
```jsx
<div className="bg-gradient-to-r from-amber-400 to-amber-600">
```

#### 2. FeedbackModal.jsx
- Change: Modal to dark theme
- Change: Inputs to dark backgrounds
- Change: Button colors to amber

**Before:**
```jsx
<div className="bg-white rounded-2xl p-8">
```

**After:**
```jsx
<div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8">
```

#### 3. FeedbackReport.jsx
- Change: All backgrounds to dark
- Change: Text to stone colors
- Change: Badges to amber scheme

### Gradient Text Components (from Prept)

Create `frontend/src/components/ui/text-gradients.jsx`:

```jsx
export const GrayTitle = ({ children }) => (
  <span className="bg-gradient-to-br from-stone-100 via-stone-300 to-stone-500 bg-clip-text text-transparent">
    {children}
  </span>
);

export const GoldTitle = ({ children }) => (
  <span className="bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 bg-clip-text text-transparent">
    {children}
  </span>
);

export const SectionLabel = ({ children }) => (
  <p className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-[0.14em] uppercase mb-4">
    <span className="w-4 h-px bg-amber-400" />
    {children}
  </p>
);
```

### Button Variants

**Gold Button (Primary):**
```jsx
<button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6 py-2.5 rounded-lg transition-all">
  Click Me
</button>
```

**Ghost Button (Secondary):**
```jsx
<button className="text-stone-400 hover:text-stone-200 transition-all">
  Click Me
</button>
```

**Outline Button:**
```jsx
<button className="border border-white/10 hover:border-amber-400/20 rounded-lg px-6 py-2.5 transition-all">
  Click Me
</button>
```

### Card Pattern

```jsx
<div className="relative bg-[#0f0f11] border border-white/10 hover:border-amber-400/20 rounded-2xl p-8 transition duration-300 overflow-hidden">
  {/* Optional gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent pointer-events-none" />
  
  {/* Content */}
  <h3 className="font-serif text-xl tracking-tight mb-2 relative">Title</h3>
  <p className="text-sm text-stone-400 leading-relaxed relative">Description</p>
</div>
```

### Form Elements

**Input:**
```jsx
<input
  className="w-full px-4 py-2.5 bg-transparent border border-white/10 rounded-lg text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
/>
```

**Textarea:**
```jsx
<textarea
  className="w-full px-4 py-2.5 bg-transparent border border-white/10 rounded-lg text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all resize-none"
/>
```

### Implementation Checklist

- [ ] Update global background to black
- [ ] Replace all emerald-* with amber-*
- [ ] Replace all slate-* with stone-*
- [ ] Update button styles to Prept variants
- [ ] Update card backgrounds to dark theme
- [ ] Add gradient text components
- [ ] Update form input styles
- [ ] Test responsive design
- [ ] Verify color contrast
- [ ] Test on different browsers

---

## 🔧 Backend API Development

### Adding New Endpoints

1. **Create Controller** (`backend/controllers/name.js`):
```javascript
export const actionName = async (req, res) => {
  try {
    const { data } = req.body;
    // Your logic
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

2. **Create Route** (`backend/routes/name.js`):
```javascript
import express from "express";
import auth from "../middlewares/auth.js";
import { actionName } from "../controllers/name.js";

const router = express.Router();
router.post("/", auth.protect, actionName);
export default router;
```

3. **Register Route** (`backend/app.js`):
```javascript
import nameRoutes from "./routes/name.js";
app.use("/api/name", nameRoutes);
```

### Database Queries

**Create Document:**
```javascript
const user = await User.create({
  email: "user@example.com",
  name: "John"
});
```

**Find Document:**
```javascript
const user = await User.findById(userId);
const users = await User.find({ role: "INTERVIEWER" });
```

**Update Document:**
```javascript
const user = await User.findByIdAndUpdate(
  userId,
  { name: "Jane" },
  { new: true }
);
```

**Delete Document:**
```javascript
await User.findByIdAndDelete(userId);
```

### Authentication Middleware

The `protect` middleware automatically extracts user info:

```javascript
// In route: auth.protect
// Sets: req.user = { id, role, profileCompleted }

export const myController = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  // ...
};
```

### Email Notifications

```javascript
import sendEmail from "../utils/sendEmail.js";

await sendEmail(
  userEmail,
  "Subject Line",
  "Email body text"
);
```

---

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Connect Vercel to repo
3. Set environment variables:
   - `VITE_API_URL` → Production backend URL
4. Deploy

### Backend Deployment (Render/Heroku)

1. Push code to GitHub
2. Connect hosting platform
3. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `EMAIL_USER`, `EMAIL_PASS`
4. Deploy

---

## 🧪 Testing

### Testing API Endpoints

Use Postman or similar:

1. **Sign Up:**
   - POST `/api/auth/signup`
   - Body: `{ email, password, name, role }`

2. **Login:**
   - POST `/api/auth/login`
   - Body: `{ email, password }`
   - Response includes JWT token

3. **Protected Route:**
   - Add header: `Authorization: Bearer <token>`

### Testing Frontend

```bash
cd frontend
npm run dev
# Open http://localhost:5173
```

---

## 📁 File Organization

### Backend Structure
```
controllers/  → Business logic
models/       → Database schemas
routes/       → API endpoints
middlewares/  → Auth, validation
services/     → Email, notifications
utils/        → Helpers
```

### Frontend Structure
```
components/   → React components
pages/        → Page components
utils/        → API, helpers
styles/       → CSS (minimal)
assets/       → Images, icons
```

---

## 🐛 Common Issues & Solutions

### Backend

**Error: Cannot find module**
```bash
# Solution: Install dependencies
npm install
```

**Error: Port already in use**
```bash
# Solution: Kill process on port
lsof -i :5001 && kill -9 <PID>
```

**Error: MongoDB connection failed**
- Check internet connection
- Verify MongoDB URI in .env
- Check IP whitelist in MongoDB Atlas

### Frontend

**Blank page loading**
- Clear browser cache
- Check console for errors
- Verify backend is running

**Styles not applying**
- Restart dev server
- Check Tailwind config
- Verify class names are correct

**API calls failing**
- Check backend is running
- Verify `VITE_API_URL` in .env
- Check network tab in DevTools

---

## 📝 Git Workflow

### Committing Changes

```bash
# Check status
git status

# Stage changes
git add .

# Commit with message
git commit -m "feat: add payout system"

# Push to remote
git push origin main
```

### Commit Messages

Follow convention:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `docs:` Documentation
- `style:` Formatting
- `test:` Tests

Example: `git commit -m "feat: add withdrawal functionality"`

---

## 🔄 Tailwind CSS

### Already Applied ✅
- Tailwind CSS 4.2.2 installed
- Vite plugin configured
- All components using Tailwind
- CSS files deleted (using utilities)

### Using Tailwind

**Colors:**
```jsx
// Text
<p className="text-stone-100">Light text</p>
<p className="text-stone-400">Muted text</p>

// Background
<div className="bg-[#0f0f11]">Dark bg</div>
<div className="bg-amber-500">Amber bg</div>

// Borders
<div className="border border-white/10">Light border</div>
<div className="hover:border-amber-400/20">Hover border</div>
```

**Spacing:**
```jsx
<div className="p-8 mb-6 gap-4">Padding and margin</div>
```

**Responsive:**
```jsx
<div className="text-base md:text-lg lg:text-xl">Responsive text</div>
```

---

## 📊 Database Schema

### User Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (INTERVIEWER/INTERVIEWEE),
  profileCompleted: Boolean,
  creditBalance: Number,
  totalEarned: Number,
  title: String (for interviewers),
  company: String,
  yearsExp: Number,
  categories: [String],
  paymentMethods: [{type, detail, isDefault}]
}
```

### Interview Schema
```javascript
{
  interviewer: ObjectId,
  interviewee: ObjectId,
  scheduledAt: Date,
  duration: Number,
  status: String,
  feedback: {
    summary: String,
    technical: String,
    communication: String,
    problemSolving: String,
    recommendation: String,
    strengths: [String],
    improvements: [String],
    overallRating: String,
    sessionRating: Number,
    sessionComment: String
  },
  recordingUrl: String,
  chatMessages: [{sender, message, timestamp}],
  creditsSpent: Number,
  creditsEarned: Number
}
```

---

## 🎯 Next Steps

1. **UI Redesign** → Apply Prept style colors and components
2. **Test Locally** → Run both backend and frontend
3. **Deploy Backend** → Push to production server
4. **Deploy Frontend** → Push to Vercel/hosting
5. **Monitor** → Check logs for errors

---

For setup instructions, see **SETUP.md**
For feature documentation, see **FEATURES.md**
