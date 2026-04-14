# 🧪 Quick Test: Available Slots Debug

## What's Ready

✅ **Frontend Logging** (`InterviewRequest.jsx`):
- Shows API response structure
- Shows slot counts (total vs available)
- Shows filtering logic for past times
- Shows debug info in UI

✅ **Backend Logging** (`availabilityController.js`):
- Shows availability query results
- Shows all slots from database
- Shows which slots are booked
- Shows final slot count returned

## How to Test

### Option 1: Full Test (5-10 minutes)

**Step 1: Start Backend**
```powershell
cd c:\Users\Lenovo\Desktop\Interview-Platform\backend
npm start
```

Watch terminal for:
```
Server running on port 5000
MongoDB connected
```

---

**Step 2: Start Frontend** (new terminal)
```powershell
cd c:\Users\Lenovo\Desktop\Interview-Platform\frontend
npm run dev
```

Watch for:
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

**Step 3: Setup Availability (as Interviewer)**

1. Open http://localhost:5173/
2. **Sign up as Interviewer**
   - Email: `interviewer@test.com`
   - Password: `Test123!@#`
   - Role: **Interviewer**
   
3. Complete Profile:
   - Skills: Python, JavaScript
   - Experience: 5 years
   - Sessions/day: 5
   
4. Go to **Set Availability**
   - Toggle all days ON
   - Duration: 60 minutes
   - Add slots:
     - 09:00 - 10:00
     - 10:00 - 11:00
     - 14:00 - 15:00
   - Save ✓

---

**Step 4: Browse & Book (as Interviewee)**

1. Sign up as **Interviewee** (new account):
   - Email: `interviewee@test.com`
   - Password: `Test123!@#`
   - Role: **Interviewee**
   
2. Go to Dashboard → **Browse Interviews**

3. Find the Interviewer you just created

4. Click **Book Interview**

5. **Select Tomorrow's Date** (important!)
   - If today is Monday → select Tuesday
   - Should show 3 slots: 09:00, 10:00, 14:00

---

**Step 5: Check Logs**

**In BACKEND terminal, you should see:**
```
🔍 Fetching slots for interviewer: [id], date: [tomorrow], dayOfWeek: [1-6]
✅ Availability query result: Found with 3 slots
📋 All slots: [{ startTime: "09:00", isBooked: false }, ...]
✅ Returning 3 available slots
```

**In FRONTEND browser console (F12):**
```
🔍 Fetching slots for interviewer: [id], date: [tomorrow]
✅ Response from backend: { success: true, data: [...] }
✅ Slots data: [...]
✅ Slots count: 3

⏰ Slot 09:00: current=[current time], slot=[540], include=true
⏰ Slot 10:00: current=[current time], slot=[600], include=true
⏰ Slot 14:00: current=[current time], slot=[840], include=true

📊 Slot filtering: total=3, isToday=false, available=3
📊 All slots: [...]
📊 Available slots after filter: [...]
```

---

**Step 6: Verify UI Shows Slots**

- Page should show: **"Found 3 available slots"**
- Should see 3 buttons: **09:00**, **10:00**, **14:00**

---

### Option 2: Quick Verification (2 minutes)

If you already have a setup, just:

```powershell
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend  
cd frontend
npm run dev
```

Then:
1. Open http://localhost:5173/login
2. Login as Interviewer
3. Go to Set Availability (if not set)
4. Logout → Login as Interviewee
5. Browse → Find Interviewer → Book
6. Select date → Check slots appear
7. **Open browser console (F12)** → See logs

---

## Expected Results

| Scenario | Expected | Backend Log | Frontend Log |
|----------|----------|-------------|--------------|
| **Slots show** | 3 buttons visible | "Returning 3 available slots" | "Slots count: 3" |
| **Selecting today** | Only future slots | "dayOfWeek: 1" | "isToday=true" |
| **All booked** | "No slots available" | "All slots are booked" | "Available slots after filter: []" |
| **No availability** | "No slots available" | "Not found" | "Available slots after filter: []" |

---

## If Slots Don't Show

### Step 1: Check Backend Logs

**If you see:** `Not found`
```
→ Availability not set for that day
→ Go back to SetAvailability
→ Make sure to select that day
→ Make sure to Save
```

**If you see:** `Returning 0 available slots`
```
→ All slots marked as booked
→ Either:
   1. Actually all booked (book another slot first)
   2. Database issue (check slots in MongoDB)
```

**If you see:** Error in terminal
```
→ Something crashed
→ Copy full error message
→ Check backend is running
```

---

### Step 2: Check Frontend Logs

**If you see:** `Slots count: 0`
```
→ Backend returned no slots
→ See "Backend Logs" section above
```

**If you see:** `API error`
```
→ Backend not responding
→ Check backend terminal
→ Make sure running on port 5000
```

**If you see:** No logs at all
```
→ Date not selected
→ Try clicking date picker
→ Select tomorrow's date
```

---

### Step 3: Common Fixes

| Problem | Solution |
|---------|----------|
| Slots not showing | Select **tomorrow**, not today |
| "No slots available" for tomorrow | Go to SetAvailability, toggle that day ON |
| Only 1-2 slots show | Check how many you added in SetAvailability |
| All slots booked | That's expected! Book a different date |
| Page crashes | Check browser console for errors (F12) |
| Backend won't start | Run `npm install` first, check port 5000 free |

---

## Debug Checklist

Before asking for help, verify:

- [ ] Backend running (see "Server running on port 5000")
- [ ] Frontend running (see "Local: http://localhost:5173")
- [ ] Interviewed interviewed logged in as **Interviewer**
- [ ] Availability **saved** (see success message)
- [ ] At least **1 day selected** with **3+ slots**
- [ ] Logged in as **Interviewee** in separate browser/incognito
- [ ] Selecting **tomorrow's date** (not today)
- [ ] Browser console open (F12) watching logs
- [ ] Backend terminal watching for logs

---

## Files with Logging

### Backend:
- `controllers/availabilityController.js` - getSlotsByDate function (lines 128-188)
- Look for: `🔍`, `✅`, `📋`, `📊`, `⚠️`, `❌`

### Frontend:
- `components/roles/interviewee/InterviewRequest.jsx` - lines 32-70
- Look for: `🔍`, `✅`, `⏰`, `📊`, `❌`

---

## Next Steps After Test

**If slots show ✅:**
- Great! The booking system works
- Try booking an interview
- Check upcoming bookings
- Test joining via waiting room

**If slots don't show ❌:**
- Share the console logs with the following:
  1. Backend terminal output
  2. Browser console (F12) output
  3. Screenshot of InterviewRequest page
  4. The date you selected
  5. The day of week for that date

---

🎯 **Bottom Line:**
When you select a date on the booking page, you should see:
1. **Backend logs** showing slot query
2. **Frontend logs** showing slots received
3. **UI buttons** showing each available time slot

All three confirm the system is working! 🚀
