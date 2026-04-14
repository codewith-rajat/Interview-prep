# 🎥 Enhanced Interview Joining System

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│           INTERVIEW JOINING FLOW                         │
└─────────────────────────────────────────────────────────┘

1. UPCOMING INTERVIEWS PAGE
   ├─ UpcomingInterviews.jsx (Interviewer)
   └─ UpcomingBookings.jsx (Interviewee)
          ↓
   [Time Check: 5 mins before to live?]
   ├─ YES → Join button ENABLED
   └─ NO  → Join button DISABLED
          ↓
   [User clicks "Join"]
          ↓
   
2. WAITING ROOM (NEW!)
   ├─ JoinWaitingRoom.jsx
   ├─ Shows interview details
   ├─ Shows other participant
   ├─ Real-time countdown timer
   ├─ Join eligibility status
   └─ Tips for good call quality
          ↓
   [Time to start or room opened?]
   ├─ YES → "Join Video Call" button ENABLED
   └─ NO  → Shows "Waiting..." button
          ↓
   [User clicks "Join Video Call"]
          ↓

3. VIDEO CALL ROOM
   ├─ VideoCall.jsx
   ├─ Establishes WebRTC connection
   ├─ Exchanges offer/answer via Socket.io
   ├─ Shows both participants' videos
   ├─ Controls: Mute/Camera/End Call
   └─ Real-time connection quality indicator
          ↓
   [Call ends when both users leave]
```

## Component Flow

### 1. **Upcoming Interviews / Bookings Page**
```jsx
// File: UpcomingInterviews.jsx or UpcomingBookings.jsx

isJoinEnabled(time) => {
  const diff = time - now;
  return diff <= 5*60*1000 && diff >= -60*60*1000;
}

User clicks Join
  ↓
navigate("/join/" + roomId)
```

### 2. **Waiting Room (JoinWaitingRoom.jsx)**

**Features:**
- ✅ Fetches interview by roomId
- ✅ Displays other participant details
- ✅ Real-time countdown to start time
- ✅ Shows join eligibility
- ✅ Tips for best call quality
- ✅ Permission checks before entering

**Props:**
```javascript
// Route params
:roomId = UUID of the interview room
```

**State:**
```javascript
const [interview, setInterview] = useState(null);      // Interview details
const [otherUser, setOtherUser] = useState(null);      // Other participant
const [timeUntilStart, setTimeUntilStart] = useState(null); // Countdown
const [canJoin, setCanJoin] = useState(false);         // Join eligibility
const [currentUser, setCurrentUser] = useState(null);  // Current user info
```

**Lifecycle:**
1. On mount → Fetch interview and user data
2. Every 1s → Update countdown timer and join eligibility
3. On join → Navigate to `/video-call/:roomId`

### 3. **Video Call (VideoCall.jsx)**

**Enhanced Features:**
- ✅ Improved video quality negotiation
- ✅ Audio processing (echo cancellation, noise suppression)
- ✅ Connection quality monitoring
- ✅ Real-time status indicators
- ✅ Better error handling

**State:**
```javascript
const [isCallStarted, setIsCallStarted] = useState(false);
const [isAudioOn, setIsAudioOn] = useState(true);
const [isVideoOn, setIsVideoOn] = useState(true);
const [isRemoteConnected, setIsRemoteConnected] = useState(false);
const [callDuration, setCallDuration] = useState(0);
const [connectionQuality, setConnectionQuality] = useState("good"); // good|fair|poor
```

**Connection Quality Calculation:**
```javascript
// Every 3 seconds, measure:
- Video bitrate (kbps)
- Packet loss rate

Quality Levels:
├─ GOOD: bitrate > 2000 kbps, packet loss < 5
├─ FAIR: bitrate > 1000 kbps
└─ POOR: bitrate ≤ 1000 kbps
```

**Media Constraints:**
```javascript
// Video
{
  width: { min: 640, ideal: 1280, max: 1920 },
  height: { min: 480, ideal: 720, max: 1080 },
  facingMode: "user"
}

// Audio (with processing)
{
  echoCancellation: true,      // Remove echo
  noiseSuppression: true,      // Remove background noise
  autoGainControl: true        // Auto volume adjustment
}
```

## Updated Routes

```javascript
// App.jsx
<Route element={<ProtectedRoute/>}>
  {/* ... existing routes ... */}
  
  {/* NEW: Waiting room before joining */}
  <Route path="/join/:roomId" element={<JoinWaitingRoom/>} />
  
  {/* Actual video call */}
  <Route path="/video-call/:id" element={<VideoCall/>} />
</Route>
```

## Join Flow Sequence

```
TIME: T-10 minutes
┌─ Interview scheduled in 10 minutes
├─ User sees "Join" button DISABLED
└─ Reason: Too early (need 5 min window)

TIME: T-5 minutes (JOIN WINDOW OPENS)
┌─ Interview scheduled in 5 minutes
├─ User sees "Join" button ENABLED ✅
└─ Status: "Ready to join"

TIME: T-2 minutes (User clicks Join)
┌─ Redirects to /join/:roomId
├─ JoinWaitingRoom component loads
├─ Shows interview details
├─ Shows countdown: "2m 0s until start"
└─ "Join Video Call" button shown but DISABLED

TIME: T-0 (Interview Start Time)
┌─ JoinWaitingRoom updates
├─ Shows "Live now" instead of countdown
├─ "Join Video Call" button becomes ENABLED ✅
└─ User clicks to enter video call

TIME: T+1 minute (In Video Call)
┌─ VideoCall component loads
├─ WebRTC negotiation starts
│  ├─ First user sends OFFER
│  ├─ Second user sends ANSWER
│  ├─ ICE candidates exchanged
│  └─ Connection established
├─ Both videos stream
├─ Duration timer starts: 00:01:00
└─ Connection quality: "Good" ✅

TIME: T+1 hour (Interview Ends)
┌─ User clicks "End Call"
├─ Streams stopped
├─ Connection closed
├─ Redirects back to dashboard
└─ Interview marked as "completed"
```

## Permission Prompts

```
Browser will ask for:
1. Camera Access
   └─ "Allow camera?" → YES/NO

2. Microphone Access
   └─ "Allow microphone?" → YES/NO

If Denied:
├─ Show error message
├─ "Camera/Microphone access denied"
├─ "Please enable permissions in browser settings"
└─ Offer to try again or go back

Permission Check in Code:
const stream = await navigator.mediaDevices.getUserMedia({...})
  ├─ If success → Continue to call
  └─ If error → Show user-friendly error
```

## Connection Quality Indicators

### Header Display
```
┌─────────────────────────────────────────┐
│ 🎥 Interview Call  ● ✓ Good    ⏱ 00:05:12 │
└─────────────────────────────────────────┘

Legend:
├─ ● = Connection status (animate pulse)
├─ ✓ Good = Connection quality
└─ ⏱️ = Call duration
```

### Status Messages
```
Connected State:
├─ Green dot + "Connected"
├─ "Both participants connected • Network good"
└─ [Ready to use]

Connecting State:
├─ Yellow dot (pulsing) + "Connecting..."
└─ [Waiting for remote user]

Disconnected State:
├─ Red dot + "Disconnected"
└─ [Show reconnect options]
```

## Media Status Overlay

```
Local Video (bottom-right):
┌─────────────────┐
│                 │
│    YOUR VIDEO   │
│                 │
├─────────────────┤
│📹 On  🎙️        │  ← Status badges
└─────────────────┘
   ↓
   Shows:
   ├─ 📹 On/Off (video status)
   └─ 🎙️ (audio on) or 🔇 (muted)
```

## Enhanced Features

### 1. Audio Processing
```javascript
// Automatic audio enhancement
✓ Echo Cancellation - removes microphone feedback
✓ Noise Suppression - reduces background noise
✓ Auto Gain Control - adjusts volume automatically
```

### 2. Connection Monitoring
```javascript
// Every 3 seconds:
Check WebRTC Statistics
├─ Inbound RTP (video bitrate, packet loss)
├─ Calculate video quality
└─ Update UI indicator
```

### 3. Error Handling
```
Scenario 1: No Camera Permission
└─ Show: "Camera access denied"
└─ Action: Offer to enable in settings

Scenario 2: Poor Connection
├─ Show: Yellow "Fair" or Red "Poor" indicator
├─ Suggest: Move closer to router, reduce other apps
└─ Offer: Continue call or end

Scenario 3: Remote User Disconnects
├─ Detect: connectionState = "disconnected"
├─ Show: "Other participant disconnected"
└─ Action: Auto end call, save stats
```

## Testing Checklist

### ✅ Join Eligibility
- [ ] Join button disabled > 5 mins before
- [ ] Join button disabled > 1 hour after
- [ ] Join button enabled in 5-min window
- [ ] Status correctly updates every second

### ✅ Waiting Room
- [ ] Loads interview details correctly
- [ ] Shows correct other participant
- [ ] Countdown timer updates every second
- [ ] "Join Video Call" disabled until time
- [ ] Tips display properly
- [ ] Navigation back works

### ✅ Video Call
- [ ] Both users' videos display
- [ ] Audio works (with noise suppression)
- [ ] Mute button toggles audio tracks
- [ ] Camera toggle disables video tracks
- [ ] Duration timer counts up
- [ ] Connection quality indicator updates
- [ ] End call properly closes connection

### ✅ Quality Indicators
- [ ] Shows "Good" on fast connection
- [ ] Shows "Fair" on medium connection
- [ ] Shows "Poor" on slow connection
- [ ] Updates in real-time
- [ ] Color coding correct (green/yellow/red)

### ✅ Error Scenarios
- [ ] Handle missing camera permission
- [ ] Handle missing microphone permission
- [ ] Handle network disconnection
- [ ] Handle remote user disconnection
- [ ] Handle invalid roomId
- [ ] Handle expired interview time

## Performance Optimization

```javascript
// Bitrate limits for different networks
Fast (Good):   bitrate > 2000 kbps
Medium (Fair): 1000 - 2000 kbps
Slow (Poor):   < 1000 kbps

// Auto quality adjustment (future)
If bitrate drops → reduce resolution
If bitrate improves → increase resolution
```

## Future Enhancements

1. ✓ Screen sharing
2. ✓ Call recording
3. ✓ In-call chat
4. ✓ Whiteboard
5. ✓ Call feedback form
6. ✓ Call transfer
7. ✓ Multi-party calls
8. ✓ Scheduled reminders
9. ✓ Call analytics dashboard

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Camera not working | Permission denied | Check browser permissions |
| Audio echo | No echo cancellation | Switch to different device |
| Choppy video | Poor connection | Move closer to router |
| No remote video | User camera off | Remind user to enable |
| Disconnects often | Network unstable | Switch to wired connection |
| High latency | Distance/routing | Check network path |

