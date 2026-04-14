# 🎥 Video Interview Joining Flow

## Complete Interview Booking & Joining System

### 1. **Booking Flow (Interviewee)**
```
Interviewee Dashboard
  ↓
Browse Interviewers → Click on Interviewer
  ↓
InterviewRequest Component
  ↓
Select Date → Get Available Slots
  ↓
Select Time Slot
  ↓
Click "Book Interview"
  ↓
API: POST /interviews
  ↓
Backend: createInterview
  - ✅ Validate date/time (not in past)
  - ✅ Check double-booking (unique index)
  - ✅ Generate roomId (UUID)
  - ✅ Set status: "scheduled"
  - ✅ Mark availability slot as booked (isBooked: true)
  ↓
Response: Interview created with roomId
  ↓
Interviewee sees: UpcomingBookings page
```

### 2. **Interview States**

```
"pending"    → ❌ REMOVED (no manual accept/reject)
"scheduled"  → ✅ Auto-confirmed when booked by interviewee
"accepted"   → ✅ Can join (after manual accept if needed in future)
"cancelled"  → User cancelled
"completed"  → Interview finished
"rejected"   → ❌ REMOVED
```

### 3. **Upcoming Interviews View**

**For Interviewer (UpcomingInterviews.jsx):**
```
Filter: status === "scheduled" || status === "accepted"
       AND scheduledAt >= now

Display:
├─ Candidate Name & Email
├─ Duration, Date, Time
├─ Time Left (countdown)
├─ Status Badge: "✓ Confirmed"
└─ Action Buttons:
   ├─ Join Button (enabled 5 mins before to 1 hour after)
   └─ Cancel Button (always available)
```

**For Interviewee (UpcomingBookings.jsx):**
```
Filter: status === "scheduled" || status === "accepted"
       AND scheduledAt >= now

Display:
├─ Interviewer Name & Company
├─ Duration, Date, Time
├─ Time Left (countdown)
├─ Status Badge: "⏳ Pending" or "✓ Confirmed"
└─ Action Buttons:
   ├─ Join Button (enabled 5 mins before to 1 hour after)
   └─ Cancel Button (always available)
```

### 4. **Joining Logic**

**Join Button State:**
```javascript
isJoinEnabled = (time, status) => {
  // Only if status is "scheduled" or "accepted"
  if (status !== "scheduled" && status !== "accepted") {
    return false;
  }
  
  // Calculate time difference
  const diff = interviewTime - now;
  
  // Allow join if:
  // - 5 minutes BEFORE interview time
  // - 1 hour AFTER interview start
  return diff <= 5 * 60 * 1000 && diff >= -60 * 60 * 1000;
}
```

**Join Button States:**
- 🟢 **Green/Enabled**: Interview starts in ≤5 mins OR started <1hr ago
- 🔴 **Disabled (Gray)**: Too early or too late to join
- 🔴 **Disabled (Red)**: Status is not scheduled/accepted

### 5. **Video Call Component (VideoCall.jsx)**

```
Join → /video-call/:roomId
  ↓
VideoCall Component
  ↓
├─ Header: Interview Call + Duration Timer
├─ Video Area:
│  ├─ Remote Video (main - larger)
│  └─ Local Video (PiP - smaller, bottom-right)
├─ Controls:
│  ├─ Start Call (if not started)
│  ├─ Mute/Unmute
│  ├─ Camera On/Off
│  └─ End Call
└─ Connection Status: Connected / Connecting...
```

### 6. **Cancel Interview**

**Backend Flow:**
```
PATCH /interviews/:id/respond
Body: { status: "cancelled" }
  ↓
Authorization: Only interviewer or interviewee can cancel
  ↓
If cancelled:
  - Set status: "cancelled"
  - FREE UP availability slot
    - Set isBooked: false
    - Set bookedBy: null
  - Send cancellation email
  ↓
Response: Interview cancelled
```

**Frontend Flow:**
```
User clicks "Cancel" button
  ↓
Confirmation dialog
  ↓
API call: PATCH /interviews/:id/respond { status: "cancelled" }
  ↓
Refetch upcoming interviews
  ↓
Interview removed from list
  ↓
Slot becomes available again
```

### 7. **Database Schema**

```javascript
// InterviewSession
{
  _id: ObjectId,
  interviewer: ObjectId (ref: User),
  interviewee: ObjectId (ref: User),
  scheduledAt: DateTime,
  duration: Number,
  roomId: UUID,  // ✅ Generated on booking
  status: "scheduled" | "accepted" | "cancelled" | "completed",
  feedback: String,
  rating: Number,
  createdAt: DateTime,
  updatedAt: DateTime
}

// Availability Slots
{
  slots: [
    {
      startTime: "09:00",
      endTime: "10:00",
      isBooked: true/false,  // ✅ Updated on booking
      bookedBy: ObjectId // Interview ID
    }
  ]
}
```

### 8. **Unique Constraints (Race Condition Prevention)**

```javascript
// MongoDB Unique Index
{ interviewer: 1, scheduledAt: 1 }

This ensures:
- No two interviews for same interviewer at same time
- If duplicate booking attempt → Error 11000
- Application catches this and returns 409 Conflict
```

### 9. **Email Notifications**

```
1. Booking Confirmation
   → Sent to: Interviewee
   → When: Interview created
   → Content: Interview scheduled with interviewer details

2. Cancellation Notification
   → Sent to: Both users
   → When: Interview cancelled
   → Content: Interview cancelled, slot freed up

3. (Future) Reminder
   → Sent to: Both users
   → When: 1 hour before
   → Content: Interview starting in 1 hour
```

### 10. **Timezone Handling**

```
Frontend Slot Selection (InterviewRequest.jsx):
- User selects date in LOCAL timezone
- Backend converts to UTC for storage

Backend Processing:
- Store scheduledAt in UTC
- Unique index on UTC time

Upcoming Display:
- Fetch from DB (UTC)
- Convert to user's LOCAL timezone for display

Time Difference Calculation:
- Both times use same timezone (local)
- Math.abs(interviewTime - now) works correctly
```

## Testing Checklist

### ✅ Interviewee Flow
- [ ] Set availability as Interviewer (multiple time slots)
- [ ] Browse & find interviewer as Interviewee
- [ ] View available slots
- [ ] Book a slot → Interview created with roomId
- [ ] See interview in "Upcoming Bookings"
- [ ] Status shows "✓ Confirmed"
- [ ] Join button disabled until 5 mins before
- [ ] Join button enabled at right time
- [ ] Click Join → Navigate to video call
- [ ] Can cancel interview → Slot freed up

### ✅ Interviewer Flow
- [ ] See booked interview in "Upcoming Interviews"
- [ ] Status shows "✓ Confirmed"
- [ ] Join button disabled until 5 mins before
- [ ] Join button enabled at right time
- [ ] Click Join → Navigate to video call
- [ ] Can cancel interview → Slot freed up

### ✅ Video Call
- [ ] Start call → Request camera/mic permissions
- [ ] Start button → Both users can connect
- [ ] Audio toggle works
- [ ] Video toggle works
- [ ] Duration timer counts up
- [ ] Connection status shows
- [ ] End call → Cleanly disconnect

### ✅ Race Condition Prevention
- [ ] Two users try to book same slot simultaneously
- [ ] Second user gets: "This slot was just booked" (409)
- [ ] First user's booking succeeds

### ✅ Cancellation
- [ ] Cancel before 5 mins → Works
- [ ] Cancel during interview → Works
- [ ] Slot becomes available again
- [ ] Other user can't see cancelled interview
- [ ] Notification sent to both

## Deployment Checklist

- [ ] Backend running on port 5001
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] STUN servers configured (Google STUN)
- [ ] Socket.io connected for real-time
- [ ] Email service configured
- [ ] Environment variables set

## Known Limitations

1. Video call requires browser camera/mic permissions
2. STUN servers are public (Google's) - use TURN for production
3. No recording functionality (can add)
4. No waiting room (can add)
5. No call history/transcript (can add)
