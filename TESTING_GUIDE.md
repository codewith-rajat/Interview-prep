# Testing Guide for Chat, Mute, and Screen Share

## Current Fixes Applied ✅

### 1. Chat Messages (Sender/Receiver Identification)
**Fixed**: Messages now use Socket.io `socketId` for reliable sender identification
- Sender messages display on **RIGHT** side (amber color)
- Receiver messages display on **LEFT** side (gray color)
- Server broadcasts `socketId: socket.id` with every message

### 2. Mute Functionality
**Fixed**: Added comprehensive logging to debug mute issues
- Checks if stream exists
- Checks if audio tracks exist
- Sets track.enabled property
- Emits "mute" event to server

### 3. Screen Sharing
**Fixed**: Added detailed step-by-step logging
- Validates peer connection exists
- Step 1: Gets display media
- Step 2: Obtains display stream
- Step 3: Gets video track
- Step 4: Finds video sender
- Step 5: Replaces track with screen

---

## Testing Steps

### STEP 1: Open Two Browser Windows
- Window 1 (Interviewee): http://localhost:5173 → Login as interviewee → Go to "Upcoming Bookings"
- Window 2 (Interviewer): http://localhost:5173 → Login as interviewer → Go to "Upcoming Interviews"
- Click on the same interview session in both windows

### STEP 2: Test Mute Functionality
**In both windows:**
1. Open DevTools: Press `F12` → Click "Console" tab
2. Click "📞 Start Call" button
3. Wait 2-3 seconds for connection (you should see video from the other person)
4. **Click the "🎙️ Mute" button**
5. **Check Console for logs:**
   - You should see: `🎙️ [MUTE] Current state: isAudioOn=...`
   - Then: `🎙️ [MUTE] Found X audio tracks`
   - Then: `🎙️ [MUTE] Setting audio to: false`
   - Then: `🎙️ [MUTE] State updated to: false, will show as: 🔇 Unmute`
   - Button should change from "🎙️ Mute" to "🔇 Unmute" (RED background)

**If mute is NOT working:**
- Check if you see "❌ [MUTE] No stream available!" → Stream not initialized
- Check if you see "❌ [MUTE] No audio tracks found!" → Audio permission denied
- Check if you see "❌ [MUTE] Current state: isAudioOn=..." → Check if button is being called

### STEP 3: Test Camera Toggle
1. Click the "📹 Camera On" button
2. Check Console for logs similar to mute (but for VIDEO)
3. Button should change to "📹 Camera Off" (RED background)
4. Your video should disappear from the screen

### STEP 4: Test Chat Messages (Sender/Receiver)
1. Type a message in the chat box
2. Press Enter or click Send
3. **Check Console:**
   - Sender (you): Look for `💬 Message will display as: RIGHT ✓ (sender)`
   - Receiver (other person): Look for `💬 Message will display as: LEFT (receiver)`
4. **In the Chat Panel:**
   - Your messages should be on the RIGHT (amber/orange)
   - Other person's messages should be on the LEFT (gray)
   - Each message should appear ONCE, not duplicated

### STEP 5: Test Screen Sharing
1. Make sure video is working (peer connection established)
2. Click "📺 Share Screen" button
3. **Check Console for step-by-step logs:**
   - `📺 [1/4] Getting display media...`
   - `📺 [2/4] Display media obtained:...`
   - `📺 [3/4] Video track obtained:...`
   - `📺 [3.5/4] Found video sender: ✅ YES`
   - `📺 [4/4] Replacing track with screen...`
   - `✅ Screen sharing started!`
4. **Select a window/screen to share** when prompted
5. Button should change to "📺 Stop Share" (BLUE background)
6. Other person's screen should show your shared screen

**If screen sharing fails:**
- Check for: `❌ Failed to get display media:` → Permission denied or no screens
- Check for: `❌ No video sender found` → Peer connection issue
- Check for: `❌ Peer connection not established yet` → Need to wait for connection

---

## Console Log Reference

### Mute Logs
```
🎙️ [MUTE] Current state: isAudioOn=true, streamRef=✅
🎙️ [MUTE] Found 1 audio tracks
🎙️ [MUTE] Setting audio to: false
🎙️ [MUTE] Track 0: setting enabled=false, current enabled=true
🎙️ [MUTE] Track 0: after set enabled=false
🎙️ [MUTE] State updated to: false, will show as: 🔇 Unmute
🎙️ [MUTE] Emitted mute event: muted=true
```

### Chat Logs (Sender - You)
```
📨 RAW message received: {senderId: "...", senderName: "You", content: "hello", socketId: "abc123", ...}
📍 Current socketId: abc123
📍 Message socketId: abc123
📍 Is current user message? true
💬 Message will display as: RIGHT ✓ (sender)
```

### Chat Logs (Receiver - Other Person)
```
📨 RAW message received: {senderId: "...", senderName: "You", content: "hello", socketId: "def456", ...}
📍 Current socketId: abc123
📍 Message socketId: def456
📍 Is current user message? false
💬 Message will display as: LEFT (receiver)
```

### Screen Share Logs (Success)
```
📺 Toggle screen share - Current state: false, Peer: ✅
📺 [1/4] Getting display media...
📺 [2/4] Display media obtained: MediaStream {active: true, id: "...", ...}
📺 [3/4] Video track obtained: MediaStreamTrack {enabled: true, kind: "video", ...}
📺 [3.5/4] Found video sender: ✅ YES
📺 [4/4] Replacing track with screen...
✅ Screen sharing started!
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Mute button doesn't work | Stream not initialized | Wait for "Start Call" and connection to establish |
| Chat shows on wrong side | socketId mismatch | Check console logs - socketId should match |
| Screen share says "not allowed" | Permission denied | Click "Allow" when browser asks for screen permission |
| Screen share can't find video sender | Peer connection not established | Wait 2-3 seconds after both users join |
| No audio during call | Microphone blocked | Check browser permissions for microphone |

---

## Backend Logs to Check

In the **terminal where backend is running**, you should see:

```
🔗 User (socketId) joined room: roomId
📊 Room now has 2 user(s)
🎬 OFFER: socketId → room roomId
📞 ANSWER: socketId → room roomId
❄️ ICE: socketId → room roomId
[roomId] Chat from socketId: message content
🎙️ [MUTE] Received mute event
📺 Screen share STARTED by socketId
```

If you don't see these, check:
1. Are both users in the same room?
2. Is the server listening to the correct events?

---

## Quick Reference: Button States

### Mute Button
- **🎙️ Mute** (gray) → Audio is ON
- **🔇 Unmute** (red) → Audio is MUTED

### Video Button
- **📹 Camera On** (gray) → Video is ON
- **📹 Camera Off** (red) → Video is OFF

### Screen Share Button
- **📺 Share Screen** (gray) → Not sharing
- **📺 Stop Share** (blue) → Currently sharing

---

## Next Steps

1. **Start with mute testing** - This is the simplest to verify
2. **Then test chat** - Check if messages appear on correct sides
3. **Finally test screen share** - This requires everything else working

Good luck! 🚀
