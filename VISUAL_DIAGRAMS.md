# 🎥 Interview Joining System - Visual Diagrams

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Interview Platform                        │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
     ┌──────▼────────┐ ┌───▼──────────┐  ┌▼────────────────┐
     │  Dashboard    │ │  Discovery   │  │ Video System    │
     │  (Upcoming)   │ │  (Booking)   │  │ (Calling)       │
     └───────────────┘ └──────────────┘  └─────────────────┘
            │                │                    │
            │                │                    │
     ┌──────▼────────────────▼──────────────────▼────────┐
     │         Joining System (NEW!)                      │
     └──────────────────────────────────────────────────┘
            │                │                    │
    ┌───────▼────────┐ ┌────▼──────────┐ ┌──────▼──────┐
    │ UpcomingCalls  │ │ JoinWaiting   │ │ VideoCall   │
    │ (Time Logic)   │ │ Room (NEW!)   │ │ (Enhanced)  │
    │                │ │               │ │             │
    │ - Join Button  │ │ - Countdown   │ │ - Quality   │
    │ - Cancel       │ │ - Details     │ │ - Controls  │
    │ - Time Update  │ │ - Join Check  │ │ - Streaming │
    └────────────────┘ └───────────────┘ └─────────────┘
```

## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                      BOOKING FLOW                              │
└────────────────────────────────────────────────────────────────┘

Interviewee                           Backend                      DB
   │                                   │                           │
   │  1. Click "Book Interview"        │                           │
   ├──────────────────────────────────▶│                           │
   │                                   │  2. Validate date/time    │
   │                                   │  3. Check conflicts       │
   │                                   ├──────────────────────────▶│
   │                                   │  Unique index check       │
   │                                   │◀──────────────────────────┤
   │                                   │  4. Generate roomId       │
   │                                   │  5. Create interview      │
   │                                   │  6. Mark slot booked      │
   │  3. Success + roomId              │                           │
   │◀──────────────────────────────────┤                           │
   │                                   │  7. Save all              │
   │  4. Navigate to /join/:roomId     │  8. Commit transaction    │
   │                                   ├──────────────────────────▶│
   │                                   │                           │

┌────────────────────────────────────────────────────────────────┐
│                      JOINING FLOW                              │
└────────────────────────────────────────────────────────────────┘

User                    JoinWaiting                Backend          DB
│                           │                        │              │
│  1. Click "Join"          │                        │              │
├──────────────────────────▶│                        │              │
│                           │  2. Fetch interview   │              │
│                           ├──────────────────────▶│              │
│                           │                       │  Query by ID │
│                           │                       ├─────────────▶│
│                           │                       │◀─────────────┤
│                           │◀──────────────────────┤              │
│                           │  3. Show details      │              │
│                           ├─────────────────────┐ │              │
│   (Waiting Room Display)  │  - Other user       │ │              │
│◀──────────────────────────┤  - Time countdown   │ │              │
│                           │  - Join button      │ │              │
│  4. Click "Join Call"     └─────────────────────┘ │              │
├──────────────────────────▶│                        │              │
│                           │  5. Navigate /video-call/:roomId     │
│                           │                        │              │
│◀────────────────────────────────────────────────────────────────┤
│   (Video Call Starts)                              │              │

┌────────────────────────────────────────────────────────────────┐
│                      CANCEL FLOW                               │
└────────────────────────────────────────────────────────────────┘

User                   Backend                      DB
│                         │                          │
│  1. Click "Cancel"      │                          │
├────────────────────────▶│                          │
│                         │  2. Authorize user      │
│                         │  3. Set status="cancel" │
│                         │  4. Free slot           │
│                         │  5. Send emails         │
│                         ├─────────────────────────▶│
│                         │                          │
│   Success + Refetch     │  6. Commit changes      │
│◀────────────────────────┤                          │
│                         │                          │
│   (Interview removed    │                          │
│    from upcoming list)  │                          │
```

## Time Window Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│                        TIME WINDOW                              │
└─────────────────────────────────────────────────────────────────┘

        T-60min        T-5min          T+0min          T+60min
          │              │               │               │
          │              │               │               │
    ──────●──────────────●───────────────●───────────────●──────
          │              │               │               │
          │              │               │               │
        JOIN WINDOW CLOSED  JOIN WINDOW OPEN  JOIN WINDOW CLOSED
        (Too early)        ✓ Can Join         (Too late)
        
        Button: ❌         Button: ✅         Button: ❌
        Status: ⏳ Waiting  Status: 🟢 Ready   Status: ✓ Ended

Time Calculations:
├─ 60 mins before → diff = +3,600,000 ms (60*60*1000)
│   └─ JOIN DISABLED (> 5 mins before)
│
├─ 5 mins before → diff = +300,000 ms (5*60*1000)
│   └─ JOIN ENABLED! ✅
│
├─ Interview start → diff = 0 ms
│   └─ JOIN ENABLED! ✅
│
└─ 1 hour after → diff = -3,600,000 ms
    └─ JOIN DISABLED (> 1 hour after)

Condition:
  diff <= 300,000 ms    (5 mins before)
  AND
  diff >= -3,600,000 ms (1 hour after)
  = canJoin is TRUE
```

## WebRTC Connection Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│                    VIDEO CALL SETUP                              │
└──────────────────────────────────────────────────────────────────┘

User A (Initiator)         Socket.io          User B (Receiver)
    │                           │                      │
    │  1. Start Call             │                      │
    ├──────────────────────────▶ │                      │
    │     - Get camera/mic       │                      │
    │     - Create RTCPeer       │                      │
    │                            │                      │
    │  2. Create Offer           │                      │
    ├──────────────────────────▶ │  3. Receive Offer   │
    │                            ├─────────────────────▶│
    │                            │     emit("offer")   │
    │                            │                      │ Get camera/mic
    │                            │                      │ Create RTCPeer
    │                            │
    │                            │  4. Create Answer   │
    │                            │◀─────────────────────┤
    │  5. Receive Answer         │  emit("answer")     │
    │◀──────────────────────────┤                      │
    │                            │                      │
    │  6. ICE Candidates         │  7. ICE Candidates  │
    │  (Multiple)                │  (Multiple)         │
    ├──────────────────────────▶ │◀─────────────────────┤
    │     emit("ice-candidate")  │                      │
    │                            │                      │
    │  8. Connection Established │                      │
    ├────────────────────────────────────────────────────┤
    │  Both users' video streams                         │
    │                                                     │
    │  Status: ✅ Connected                              │
    │  Quality: 📊 Monitoring                            │
    │  Duration: ⏱️ Counting                             │
    │                                                     │
    │  9. User A clicks "End Call"                       │
    ├────────────────────────────────────────────────────▶
    │     All streams stopped                            │
    │     Peer connection closed                         │
    │     Socket disconnected                            │
```

## State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│              INTERVIEW LIFECYCLE                                │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   BOOKING       │
                    │  (Interviewee)  │
                    └────────┬────────┘
                             │
                             │ Book Interview
                             ▼
                    ┌─────────────────┐
                    │   SCHEDULED     │  ◀── Status: "scheduled"
                    │  (Auto-confirm) │      roomId generated
                    └────────┬────────┘
                      │      │      │
         ┌────────────┘       │     └──────────────┐
         │                    │                    │
    Time <5min         User cancels        Time >1hr
         │               before              after
         │                │                   │
         │                ▼                   │
         │           ┌──────────┐             │
         │           │CANCELLED │             │
         │           └──────────┘             │
         │               ▲                    │
         │               │ (Slot freed)       │
         │               │                    │
         ▼               │                    ▼
    ┌──────────┐         │             ┌───────────┐
    │JOIN WAIT │         │             │EXPIRED    │
    │ROOM      │         │             │(Can't join)
    └────┬─────┘         │             └───────────┘
         │               │
         │ User clicks   │
         │ "Join Call"   │
         ▼               │
    ┌──────────┐         │
    │VIDEO     │         │
    │CALL      │         │
    └────┬─────┘         │
         │               │
         │ End Call      │ Disconnect
         │               │
         └───────┬───────┘
                 │
                 ▼
         ┌─────────────┐
         │ COMPLETED   │
         │ (or expired)│
         └─────────────┘
              ▲
              │
         Save stats
         Mark complete
         Send feedback
```

## UI Layout - Video Call

```
┌─────────────────────────────────────────────────────────────────────┐
│  🎥 Interview Call  ● ✓ Good                      ⏱️ 00:15:42      │  Header
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │              REMOTE VIDEO (MAIN)                            │  │
│  │         (Larger - Main focus)                              │  │
│  │                                                              │  │
│  │  ┌────────────────────────────┐                             │  │
│  │  │  LOCAL VIDEO (PIP)         │                             │  │
│  │  │                            │                             │  │
│  │  │  📹 On  🎙️                  │  ← Status badges           │  │
│  │  └────────────────────────────┘                             │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│         🎙️ Mute    📹 Camera On    📞 End Call                       │  Controls
│         ────────    ────────────    ──────────                       │
│       (Gray)         (Gray)        (Red)                             │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  ● Connected • Both participants connected • Network good           │  Status
└─────────────────────────────────────────────────────────────────────┘
```

## Database Schema Diagram

```
┌──────────────────────────────────────────────────────────┐
│            INTERVIEW SESSIONS                           │
├──────────────────────────────────────────────────────────┤
│ _id: ObjectId                                            │
│ interviewer: ObjectId ──────┐                            │
│ interviewee: ObjectId ──────┼──▶ User Schema            │
│ scheduledAt: DateTime        │                           │
│ duration: Number             │                           │
│ roomId: String (UUID) ◀───── NEW! (Added)              │
│ status: "scheduled"  ◀────── NEW! (Changed from pending)│
│ feedback: String             │                           │
│ rating: Number               │                           │
│ createdAt: DateTime          │                           │
│ updatedAt: DateTime          │                           │
└──────────────────────────────────────────────────────────┘
       │
       │ Unique Index:
       └─ { interviewer: 1, scheduledAt: 1 }
          └─ Prevents double booking at same time

┌──────────────────────────────────────────────────────────┐
│            AVAILABILITY                                 │
├──────────────────────────────────────────────────────────┤
│ _id: ObjectId                                            │
│ interviewer: ObjectId ──────▶ User Schema               │
│ dayOfWeek: Number (0-6)                                 │
│ slots: Array[                                            │
│   {                                                      │
│     startTime: "09:00"                                   │
│     endTime: "10:00"                                     │
│     isBooked: Boolean ◀──── Updated on booking         │
│     bookedBy: ObjectId ◀─── Links to InterviewSession  │
│   }                                                      │
│ ]                                                        │
│ type: "recurring"                                        │
│ slotDuration: Number                                     │
│ isActive: Boolean                                        │
│ createdAt: DateTime                                      │
│ updatedAt: DateTime                                      │
└──────────────────────────────────────────────────────────┘
```

## Socket.io Events Flow

```
┌──────────────────────────────────────────────────────────┐
│           SOCKET.IO EVENT FLOW                          │
└──────────────────────────────────────────────────────────┘

Client A                    Server                    Client B
   │                           │                         │
   │  1. "join-room"           │                         │
   ├──────────────────────────▶│                         │
   │  { roomId: "uuid..." }    │                         │
   │                           │ Store room info         │
   │                           │                         │
   │  2. "offer"               │                         │
   ├──────────────────────────▶│ 3. "offer"              │
   │  { roomId, offer }        ├────────────────────────▶│
   │                           │                         │
   │                           │  4. "answer"            │
   │  5. "answer"              │◀────────────────────────┤
   │◀──────────────────────────┤ { roomId, answer }     │
   │  { roomId, answer }       │                         │
   │                           │                         │
   │  6a. "ice-candidate"      │                         │
   ├──────────────────────────▶│ 6b. "ice-candidate"    │
   │ (multiple times)          ├────────────────────────▶│
   │                           │ (multiple times)        │
   │                           │                         │
   │  7. "user-disconnected"   │                         │
   │  (when other leaves)      │                         │
   │◀──────────────────────────┤                         │
   │                           │                         │
   │  8. "leave-room"          │                         │
   ├──────────────────────────▶│ 9. "user-disconnected"  │
   │                           ├────────────────────────▶│
```

## Connection Quality Visualization

```
GOOD Connection
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Video Bitrate: ███████████ 2500+ kbps
Packet Loss:   ░░░░░░░░░░░ < 5%
Latency:       ███░░░░░░░░ < 100ms
Quality:       ✓ GOOD
Color:         🟢 Green


FAIR Connection
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Video Bitrate: ██████░░░░░ 1500 kbps
Packet Loss:   ████░░░░░░░ 8%
Latency:       ███████░░░░ 150ms
Quality:       ⚠ FAIR
Color:         🟡 Yellow


POOR Connection
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Video Bitrate: ███░░░░░░░░ 800 kbps
Packet Loss:   ████████░░░ 15%
Latency:       █████████░░ 300ms
Quality:       ✕ POOR
Color:         🔴 Red
```

---

This visual architecture shows how all components work together in the interview joining system!

