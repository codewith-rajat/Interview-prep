# 🔍 Debugging Available Slots

## Issue: Available Slots Not Showing

We've added comprehensive logging to help debug this issue.

## How to Debug

### Step 1: Open Browser Console
```
Press: F12 or Right-click → Inspect → Console
```

### Step 2: Book Interview Flow
```
1. Go to dashboard
2. Browse for interviewer
3. Click "Book Interview"
4. Select a date
```

### Step 3: Watch the Console Logs

**Expected output in console:**

```javascript
// Step 1: API Request
🔍 Fetching slots for interviewer: [user_id], date: [date]

// Step 2: Response received
✅ Response from backend: { success: true, data: [...] }
✅ Slots data: [...]
✅ Slots count: [number]

// Step 3: Filtering logic
📊 All slots: [...]
⏰ Slot [time]: current=[minutes], slot=[minutes], include=[true/false]
...more slot logs...
📊 Available slots after filter: [...]
📊 Slot filtering: total=[X], isToday=[true/false], available=[Y]
```

## Interpreting the Logs

### If slots show but filtered to 0:
```
Example:
  All slots: [
    {startTime: "09:00", ...},
    {startTime: "10:00", ...},
    {startTime: "11:00", ...}
  ]
  
  Available slots after filter: []

Meaning:
  → All slots are in the past (if today)
  → Or there's a filtering issue
```

### If "Slots count: 0":
```
Meaning:
  → Backend returned no slots
  → Either:
    1. No availability set for this interviewer
    2. No slots for this day of week
    3. All slots already booked
```

### If API error:
```
Example:
  ❌ Error fetching slots: [error message]
  ❌ Full error: [full error object]

Meaning:
  → Check interviewerId is correct
  → Check date format is correct
  → Check backend is running
```

## Common Scenarios

### Scenario 1: No slots for future dates
```
Problem: You select tomorrow but nothing shows

Solution:
  1. Check if availability was set for tomorrow's day of week
  2. Go to SetAvailability as interviewer
  3. Verify slots are set for that day
  4. Save and try again
```

### Scenario 2: Only past slots showing as unavailable
```
Problem: Select today, all slots filtered out

Logs show:
  - All slots: [09:00, 10:00, 11:00]
  - Available after filter: []
  
Meaning:
  → It's past 11:00 AM already
  → Try selecting tomorrow
  
Solution:
  → Try selecting a future date
  → Or wait until before 09:00 to book morning slots
```

### Scenario 3: Slots show in console but not in UI
```
Problem: Console shows slots but page shows "No slots available"

Cause:
  → React component not re-rendering
  
Solution:
  1. Refresh page (Ctrl+R)
  2. Check browser console for errors
  3. Verify selectedDate state updated
```

## Testing Checklist

Before testing slots, ensure:

- [ ] **Availability Set**
  ```
  Login as Interviewer
  → Go to "Set Availability"
  → Add slots for tomorrow (e.g., Monday)
  → Save
  ```

- [ ] **Date is Tomorrow**
  ```
  If today is Monday
  → Select Tuesday in booking
  → Should show Monday's slots ✓
  ```

- [ ] **Slots Not Past Time**
  ```
  If booking for today (today is Monday 2 PM)
  → Only slots after 2 PM show
  → 10:00 AM slot won't show (in past)
  ```

- [ ] **Database Slots Not All Booked**
  ```
  If selecting tomorrow
  → But no slots appear
  → Check they're not all marked isBooked: true
  ```

## Quick Test

### Test 1: Set Availability
```
As Interviewer:
  1. Go to Dashboard → Set Availability
  2. Select all days
  3. Duration: 60 minutes
  4. Add slots: 9:00-10:00, 10:00-11:00, 14:00-15:00
  5. Save

As Interviewee:
  1. Go to Dashboard → Browse
  2. Find same interviewer
  3. Click "Book"
  4. Select tomorrow's date
  5. Should see 3 slots!
```

### Test 2: Check Logs
```
Open Console (F12)
Select date
Look for logs:
  ✅ Slots count: 3
  📊 Available slots: [09:00, 10:00, 14:00]
  
If OK → Slots are working!
If not → See scenarios above
```

## Backend Debugging

If frontend shows "No slots available", check backend:

```bash
# Look in terminal where backend is running
# You should see logs like:

🔍 Fetching slots for interviewer: [id], date: [date], dayOfWeek: [0-6]
✅ Availability query result: Found with 3 slots
📋 All slots: [
  { startTime: "09:00", isBooked: false },
  { startTime: "10:00", isBooked: false },
  { startTime: "14:00", isBooked: false }
]
✅ Returning 3 available slots
```

If you see "Not found" instead, it means:
- No availability record for that interviewer/day
- Need to set availability first

## Fixed Issues & Improvements

✅ **Added detailed logging** to track slots from API to UI
✅ **Added count display** showing how many slots found
✅ **Added debug info** when no slots available
✅ **Added time comparison logs** for filtering logic
✅ **Added full error details** for debugging API issues

## Next Steps

1. **Try the test above** → Verify slots appear
2. **Check console logs** → Look for any errors
3. **Report any issues** with the console output

---

## Important: How Slots Work

```
Database Structure:
  Availability (one per day of week)
  └─ slots: Array[
       { startTime: "09:00", endTime: "10:00", isBooked: false },
       { startTime: "10:00", endTime: "11:00", isBooked: false }
     ]

When Booking:
  1. User selects date
  2. Frontend calculates day of week (0-6)
  3. Backend finds availability for that day
  4. Returns only slots where isBooked: false
  5. Frontend filters out past times (if today)
  6. Shows remaining slots

When Slot Booked:
  1. Create Interview record
  2. Mark slot as isBooked: true
  3. Next time user fetches → Slot not in list
```

---

If slots still don't appear after checking this guide, please share:
1. Screenshot of console logs
2. The date you selected
3. The day of week for that date
4. Any error messages shown

