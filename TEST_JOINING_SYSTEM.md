# 🧪 Complete Interview Joining System - Test Script

## Prerequisites
- ✅ Backend running on port 5001
- ✅ Frontend running on port 5173
- ✅ MongoDB connected
- ✅ Two test user accounts created

## Test Users
```
User 1 (Interviewer):
├─ Email: interviewer@test.com
├─ Password: Test@1234
├─ Role: Interviewer
└─ Status: Profile complete with availability

User 2 (Interviewee):
├─ Email: interviewee@test.com
├─ Password: Test@1234
├─ Role: Interviewee
└─ Status: Profile complete
```

---

## TEST CASE 1: Booking an Interview

### Setup
1. Login as Interviewer
2. Go to Dashboard → Set Availability
3. Set time slots for today
   - Example: 9:00-10:00, 10:00-11:00, 11:00-12:00
4. Save availability

### Test Steps
1. Logout and login as Interviewee
2. Go to Dashboard → Browse Interviewers
3. Find and click on Interviewer profile
4. Click "Book Interview"
5. Select today's date
6. Verify all slots appear
7. Select first slot (9:00-10:00)
8. Click "Book Interview"

### Expected Results
✅ Interview created successfully
✅ Status: "scheduled" (auto-confirmed)
✅ roomId generated (UUID)
✅ Slot marked as booked in DB
✅ Toast: "Interview booked successfully"
✅ Redirects to dashboard

### Verification Steps
1. Go to "Upcoming Bookings"
2. Verify interview appears
3. Check status badge: "✓ Confirmed"
4. Verify slot removed from available list

---

## TEST CASE 2: Join Button Time Logic

### Setup
- Interview scheduled: 10:30 AM today
- Current time: 10:00 AM

### Test 1A: 5 Minutes Before (10:25 AM)
1. Go to Upcoming Bookings
2. Find the interview
3. Check Join button

**Expected:** 🟢 Join button ENABLED (green)

### Test 1B: More Than 5 Minutes Before (10:20 AM)
1. Go to Upcoming Bookings
2. Find the interview

**Expected:** 🔴 Join button DISABLED (gray)

### Test 1C: Interview Time (10:30 AM)
1. Go to Upcoming Bookings
2. Check Join button

**Expected:** 🟢 Join button ENABLED (green)

### Test 1D: After Interview (11:15 AM)
1. Go to Upcoming Bookings
2. Check Join button

**Expected:** 🔴 Join button DISABLED (gray)
**Reason:** More than 1 hour after scheduled time

### Test 1E: During Interview (10:45 AM)
1. Go to Upcoming Bookings
2. Check Join button

**Expected:** 🟢 Join button ENABLED (green)

---

## TEST CASE 3: Waiting Room Flow

### Setup
- Interview scheduled: 10:30 AM
- Both users online and ready

### Test Steps (as Interviewee)
1. Go to Upcoming Bookings
2. When join button enabled, click "Join"
3. Verify route changed to `/join/:roomId`

### Waiting Room Page Should Show
✅ Interview header: "🎥 Ready to Join?"
✅ Other participant name: "Interviewer Name"
✅ Interview details:
   - Scheduled Time: 10:30
   - Duration: 60 minutes
   - Time until start: countdown

### Before Join Time
✅ "Join Video Call" button DISABLED
✅ Message: "You can join up to 5 minutes before"

### After Join Time
✅ "Join Video Call" button ENABLED
✅ Message: "✅ Interview is ready! You can join now"
✅ Countdown shows: "Live now"

### Test Steps (as Interviewer)
1. Go to Upcoming Interviews
2. When join button enabled, click "Join"
3. Follow same flow as Interviewee

---

## TEST CASE 4: Video Call Connection

### Setup
- Both users on Waiting Room page
- Interview time reached
- Both click "Join Video Call"

### Video Call Page Should Show
✅ Header: "🎥 Interview Call" with connection status
✅ Two video sections:
   - Remote video (main, larger)
   - Local video (pip, smaller, bottom-right)
✅ Controls:
   - 📞 Start Call (if not started)
   - 🎙️ Mute (if call started)
   - 📹 Camera On (if call started)
   - 📞 End Call (if call started)
✅ Status: "Waiting for remote user..." initially

### Connection Sequence
1. First user clicks "Start Call"
   - ✅ WebRTC offer generated
   - ✅ Offer sent via Socket.io
   - Status: "Connecting..."

2. Second user receives offer
   - ✅ Answer generated
   - ✅ Answer sent via Socket.io
   - Status: "Connecting..."

3. ICE candidates exchanged
   - ✅ Multiple ICE candidates sent
   - Status still: "Connecting..."

4. Connection established
   - ✅ Remote video appears
   - ✅ Status changes to: "Connected ✓"
   - ✅ Connection quality: "Good" (green badge)

### Expected Timeline
- T+0s: Start Call → Offer sent
- T+1s: Answer received → Connecting
- T+2s: ICE negotiation → Still connecting
- T+3-5s: Connection established → Remote video appears

---

## TEST CASE 5: Audio/Video Controls

### Setup
- Both users in active video call
- Connected and videos showing

### Test 5A: Mute Audio
1. Click "🎙️ Mute" button
2. Button changes to "🔇 Unmuted" (red)
3. Your audio is disabled
4. Other user cannot hear you

**Verify on other end:**
- Their audio input from you drops

### Test 5B: Camera Off
1. Click "📹 Camera On" button
2. Button changes to "📹 Camera Off" (red)
3. Your video stream stops
4. Local video shows "Camera Off" badge

**Verify on other end:**
- Your remote video goes black/frozen

### Test 5C: Turn Audio Back On
1. Click "🔇 Unmuted" button
2. Button changes to "🎙️ Mute" (green)
3. Your audio is enabled

### Test 5D: Turn Camera Back On
1. Click "📹 Camera Off" button
2. Button changes to "📹 Camera On" (green)
3. Your local video shows again

---

## TEST CASE 6: Connection Quality Indicator

### During Active Call
1. Check header for quality badge

### Test 6A: Good Connection
- **Conditions:** Fast internet, < 100ms latency
- **Expected Display:**
  ```
  🎥 Interview Call ● ✓ Good
  ```
- **Color:** Green badge
- **Status message:** "Connected • Network good"

### Test 6B: Fair Connection
- **Conditions:** Medium internet, 100-300ms latency
- **Expected Display:**
  ```
  🎥 Interview Call ● ⚠ Fair
  ```
- **Color:** Yellow badge
- **Status message:** "Connected • Network fair"

### Test 6C: Poor Connection
- **Conditions:** Slow internet, > 300ms latency
- **Expected Display:**
  ```
  🎥 Interview Call ● ✕ Poor
  ```
- **Color:** Red badge
- **Status message:** "Connected • Network poor"

---

## TEST CASE 7: End Call

### Setup
- Both users in active video call

### Test Steps
1. Click "📞 End Call" button
2. Streams should stop immediately
3. Verify:
   - ✅ Local video stops
   - ✅ Remote video disappears
   - ✅ Duration timer stops
   - ✅ Socket disconnection sent

### Expected Results
- ✅ Redirects to previous page (dashboard)
- ✅ Other user gets disconnection notification
- ✅ Other user's call ends automatically
- ✅ Interview marked as "completed" in DB

---

## TEST CASE 8: Cancel Interview

### Setup
- Upcoming interview scheduled
- Interview in "scheduled" status

### Test Steps (as Interviewee)
1. Go to Upcoming Bookings
2. Find interview
3. Click "Cancel" button
4. Confirm cancellation dialog

**Expected Results:**
- ✅ Interview status → "cancelled"
- ✅ Availability slot freed up (isBooked: false)
- ✅ Interview removed from list
- ✅ Toast: "Interview cancelled successfully"

### Verification (as Interviewer)
1. Go to Set Availability
2. Check that slot is available again
3. Verify you can see 4 slots instead of 3

### Test Steps (as Interviewer)
1. Go to Upcoming Interviews
2. Find interview
3. Click "Cancel" button

**Same expected results as interviewee**

---

## TEST CASE 9: Multiple Interviews in Same Day

### Setup
1. As Interviewer: Set 4 time slots
   - 9:00-10:00
   - 10:00-11:00
   - 11:00-12:00
   - 14:00-15:00

2. As Interviewee: Book 3 of them
   - Book 9:00
   - Book 10:00
   - Book 11:00

### Test Steps
1. Check Upcoming Bookings
2. Verify all 3 appear
3. Check Join buttons respect time windows
4. Join first interview at 9:00
5. End call at 9:30
6. Try to join second at 10:00
7. Each should work independently

**Expected Results:**
- ✅ All interviews listed
- ✅ Join buttons work per interview
- ✅ Separate video call rooms
- ✅ Can quickly move between calls

---

## TEST CASE 10: Race Condition Prevention

### Setup
- Interview slot: 15:00
- Two interviewees trying to book same slot
- Network slightly delayed

### Test Steps (Simulate Concurrency)
1. **User A:** Click "Book Interview" at T+0ms
2. **User B:** Click "Book Interview" at T+50ms (same slot)

### Expected Results
- ✅ User A booking succeeds
  - Interview created
  - roomId generated
  - Slot marked booked

- 🔴 User B booking fails
  - HTTP 409 Conflict
  - Message: "This slot was just booked by another user"
  - Toast: Error shown to User B
  - User can select different slot

### Verification
Check MongoDB:
```javascript
db.interviewsessions.find({
  interviewer: "...",
  scheduledAt: new Date("2024-04-14T15:00:00Z")
})
// Should return exactly 1 interview (User A's)
```

---

## TEST CASE 11: Permission Errors

### Setup
- Browser with camera/mic permission denied

### Test Steps
1. Go to interview
2. Click "Join"
3. Go to Waiting Room
4. Click "Join Video Call"
5. WebRTC will try to access camera/mic

### Expected Results
🔴 **Browser Permission Dialog Appears:**
- "Allow camera?" → NO
- "Allow microphone?" → NO

### After Denying
✅ User-friendly error message:
```
"Could not access camera/microphone.
Please check permissions in your browser settings."
```

### Fix
1. Allow permissions in browser settings
2. Refresh page
3. Try again → Should work

---

## TEST CASE 12: Network Disconnection During Call

### Setup
- Both users in active video call
- Simulate network disconnect

### Test Steps (Advanced - Use Dev Tools)
1. Open DevTools → Network tab
2. Check "Offline" checkbox
3. Observe what happens

### Expected Results
- ✅ Connection status changes to "Disconnected"
- ✅ Remote video stops updating
- ✅ Duration timer still counts
- ✅ Options:
   - Can still end call
   - Try to reconnect (if implemented)

### Reconnection Test
1. Uncheck "Offline" in DevTools
2. Page should auto-reconnect
3. Remote video resumes
4. Status back to "Connected"

---

## TEST CASE 13: Interview History (Past Interviews)

### Setup
- Interview completed 1 hour ago

### Test Steps
1. Go to Dashboard
2. Check "Past Interviews" tab
3. Find completed interview

**Expected Results:**
- ✅ Shows in Past Interviews
- ✅ Status: "completed"
- ✅ Does NOT show in Upcoming
- ✅ Timestamp accurate
- ✅ Other participant visible

---

## TEST CASE 14: Timezone Consistency

### Setup
- Interviewer in UTC+5:30 (India)
- Interviewee in UTC+0 (London)

### Test Steps
1. Interviewer sets availability: "15:00 IST"
2. Interviewee browses: Should see in their timezone
3. Book interview
4. Both check Upcoming: Should show same interview

**Expected Results:**
- ✅ Both see same interview
- ✅ Times correctly converted
- ✅ No timezone mismatch
- ✅ Join time window same for both

---

## TEST CASE 15: End-to-End Full Flow

### Complete Workflow
1. **Interviewer Setup (5 min)**
   - Login
   - Go to Set Availability
   - Set 2 slots: 10:00-11:00, 11:00-12:00
   - Save

2. **Interviewee Browse (5 min)**
   - Login as Interviewee
   - Dashboard → Browse
   - Find interviewer
   - Click on profile
   - See "Book Interview" button

3. **Interviewee Book (3 min)**
   - Go to booking page
   - Select today's date
   - See both slots
   - Select 10:00 slot
   - Confirm booking
   - See in Upcoming Bookings

4. **Wait for Join Time (5 min)**
   - Wait until 9:55 (5 mins before)
   - Refresh page
   - Join button should be enabled

5. **Waiting Room (2 min)**
   - Click Join
   - See waiting room
   - See other participant
   - See countdown timer
   - Join button disabled (too early)

6. **Join Call (1 min)**
   - Wait for 10:00
   - Join button enables
   - Click "Join Video Call"

7. **Video Call (2 min)**
   - WebRTC connects
   - Both videos show
   - Duration timer counts
   - Can mute/camera
   - See connection quality

8. **End Call (1 min)**
   - Click "End Call"
   - Redirects to dashboard
   - Interview marked completed

**Total Time: ~25 minutes**

---

## Regression Tests

### Always Check After Changes
- [ ] Bookings appear in upcoming
- [ ] Slots correctly marked booked
- [ ] Join button time window correct
- [ ] Waiting room loads with interview data
- [ ] Video call connects successfully
- [ ] Audio/video controls work
- [ ] End call disconnects properly
- [ ] Cancel interview frees slot
- [ ] Past interviews show correctly
- [ ] No console errors
- [ ] No network errors

---

## Performance Metrics

### Target Metrics
| Metric | Target | Acceptable |
|--------|--------|------------|
| Booking Response | <500ms | <1000ms |
| Video Call Connect | <5s | <10s |
| First Remote Frame | <2s | <5s |
| Join Room Load | <1s | <2s |
| API Response Time | <200ms | <500ms |

### How to Measure
1. Open DevTools → Network tab
2. Book interview → Note timing
3. Join call → Note connection timing
4. Check Console for timing logs

---

## Debug Mode

### Enable Detailed Logging
```javascript
// In VideoCall.jsx, add:
console.log("📊 Connection stats:", stats);
console.log("🎥 Video quality:", connectionQuality);
console.log("🎙️ Audio:", isAudioOn);

// Check browser console for real-time data
```

### Check Backend Logs
```bash
# Terminal running backend
# Look for:
# ✅ Interview created
# 📍 Slot marked booked
# 🔍 Double booking check
# ✅ Socket connected
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Join button never enables | Check system clock, check time math |
| Video call won't connect | Check firewall, check STUN servers |
| Only one video shows | Check that both called startCall |
| No audio | Check microphone permissions |
| Echo in audio | Other user should mute |
| Video choppy | Check connection quality, lower resolution |
| Waiting room won't load | Check roomId is correct, check auth |

---

