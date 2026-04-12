# Visual Guide - Custom Availability Feature

## UI Layout

### SetAvailability Page

```
┌─────────────────────────────────────────────────────────────────┐
│  Set Your Availability                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [Recurring (Weekly)]  [Custom (Specific Dates)]                │
│                                                                   │
│  ┌─────────────────────────────────┬─────────────────────────┐  │
│  │ RECURRING FORM (LEFT SIDE)      │ YOUR AVAILABILITIES     │  │
│  │ or CUSTOM FORM (LEFT SIDE)      │ (RIGHT SIDE)            │  │
│  │                                 │                         │  │
│  │ ┌─────────────────────────────┐ │ ┌─────────────────────┐ │  │
│  │ │ Day of Week: [Monday]       │ │ │ Monday              │ │  │
│  │ │                             │ │ │ Every week          │ │  │
│  │ │ Start Time: [09:00]         │ │ │ 09:00 - 17:00       │ │  │
│  │ │                             │ │ │ Duration: 60 min    │ │  │
│  │ │ End Time: [17:00]           │ │ │                     │ │  │
│  │ │                             │ │ │ [Delete]            │ │  │
│  │ │ Duration: [60]              │ │ │                     │ │  │
│  │ │                             │ │ ├─────────────────────┤ │  │
│  │ │ [Save Recurring]            │ │ │ Apr 20, 2026        │ │  │
│  │ └─────────────────────────────┘ │ │ Custom date         │ │  │
│  │                                 │ │ 09:00 - 10:00       │ │  │
│  │ OR (Custom Tab)                 │ │ 10:30 - 11:30       │ │  │
│  │                                 │ │ Duration: 30 min    │ │  │
│  │ ┌─────────────────────────────┐ │ │                     │ │  │
│  │ │ Date: [2026-04-20]          │ │ │ [Delete]            │ │  │
│  │ │                             │ │ │                     │ │  │
│  │ │ Duration: [30]              │ │ │ No availabilities   │ │  │
│  │ │                             │ │ │ set yet             │ │  │
│  │ │ Time Slots:                 │ │ │                     │ │  │
│  │ │ ┌──────────────┬──────────┐ │ │ │ Add your first!     │ │  │
│  │ │ │Start │End  │[✕] │ │ availability   │ │  │
│  │ │ │[09:00] │[10:00]│   │ │ │                     │ │  │
│  │ │ ├──────────────┼──────────┤ │ │ └─────────────────────┘ │  │
│  │ │ │[10:30] │[11:30]│   │ │ │                         │  │
│  │ │ ├──────────────┼──────────┤ │ └─────────────────────────┘  │
│  │ │ │[14:00] │[15:00]│[✕] │ │                              │  │
│  │ │ └──────────────┴──────────┘ │                              │  │
│  │ │                             │                              │  │
│  │ │ [+ Add Slot]                │                              │  │
│  │ │                             │                              │  │
│  │ │ [Save Custom Availability]  │                              │  │
│  │ └─────────────────────────────┘                              │  │
│  │                                                               │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Creating Availability

```
Interviewer
    │
    ├─── Fills Form (Date + Slots)
    │
    ├─── Clicks "Save"
    │
    ├─→ Frontend Validation
    │    ├─ Check date (future only)
    │    ├─ Check slots filled
    │    └─ Check duration > 0
    │
    ├─→ API Request (POST /availability/custom)
    │
    ├─→ Backend Validation
    │    ├─ Auth check
    │    ├─ Role check (must be interviewer)
    │    └─ Data validation
    │
    ├─→ Database Operation (upsert)
    │    ├─ Check if custom availability exists for that date
    │    ├─ If yes: Update
    │    └─ If no: Create
    │
    ├─→ Response with saved availability
    │
    ├─→ Frontend Updates
    │    ├─ Show success toast
    │    ├─ Clear form
    │    └─ Refresh availability list
    │
    └─── User sees confirmation
```

### Booking Availability

```
Interviewee selects date
    │
    ├─→ API Request (GET /availability/slots)
    │    └─ Includes: interviewerId, date
    │
    ├─→ Backend Query Logic
    │    │
    │    ├─ Step 1: Check Custom Availability
    │    │    └─ Query: { interviewer, date, type: "custom" }
    │    │
    │    ├─ Step 2: If not found, Check Recurring
    │    │    └─ Query: { interviewer, dayOfWeek, type: "recurring" }
    │    │
    │    ├─ Step 3: Generate Slots
    │    │    └─ Use startTime, endTime, slotDuration
    │    │
    │    └─ Step 4: Filter Booked Slots
    │         └─ Exclude slots already booked by others
    │
    ├─→ Return Available Slots
    │
    └─→ Interviewee books slot
```

---

## State Management - Frontend

```
SetAvailability Component State:

┌─────────────────────────────────────────────────┐
│ UI State                                        │
├─────────────────────────────────────────────────┤
│ • tab: "recurring" | "custom"                   │
│ • loading: boolean                              │
│ • toast: { message, type } | null               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Data State                                      │
├─────────────────────────────────────────────────┤
│ • availabilities: Availability[]                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Recurring Form State                            │
├─────────────────────────────────────────────────┤
│ • day: number (0-6)                             │
│ • startTime: "HH:MM"                            │
│ • endTime: "HH:MM"                              │
│ • slotDuration: number                          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Custom Form State                               │
├─────────────────────────────────────────────────┤
│ • customDate: "YYYY-MM-DD"                      │
│ • customSlots: [                                │
│    { startTime: "HH:MM", endTime: "HH:MM" },   │
│    ...                                          │
│   ]                                             │
│ • customSlotDuration: number                    │
└─────────────────────────────────────────────────┘
```

---

## Database Schema Diagram

```
AVAILABILITY COLLECTION

_id: ObjectId
├── interviewer: ObjectId → User
├── type: String (enum: "recurring" | "custom")
├── dayOfWeek: Number (0-6, null if custom)
├── date: Date (null if recurring, stored as start of day)
├── slots: Array [
│   ├── startTime: String "HH:MM"
│   ├── endTime: String "HH:MM"
│   ├── isBooked: Boolean
│   └── bookedBy: ObjectId → InterviewSession
│ ]
├── slotDuration: Number (minutes)
├── isActive: Boolean
├── createdAt: Date
└── updatedAt: Date

INDEXES:
├── { interviewer: 1, dayOfWeek: 1, type: 1 }  (recurring)
└── { interviewer: 1, date: 1, type: 1 }       (custom)
```

---

## Component Hierarchy

```
SetAvailability
├── Tab Navigation
│   ├── "Recurring" Button
│   └── "Custom" Button
├── Left Side - Form
│   ├── Recurring Form (conditional)
│   │   ├── Day Select
│   │   ├── Start Time Input
│   │   ├── End Time Input
│   │   ├── Duration Input
│   │   └── Submit Button
│   └── Custom Form (conditional)
│       ├── Date Input
│       ├── Duration Input
│       ├── Time Slots
│       │   ├── Slot Item (repeated)
│       │   │   ├── Start Time
│       │   │   ├── End Time
│       │   │   └── Delete Button
│       │   └── Add Slot Button
│       └── Submit Button
├── Right Side - List
│   └── Availabilities List
│       └── Availability Item (repeated)
│           ├── Title (Day/Date)
│           ├── Type Badge
│           ├── Time Slots
│           ├── Duration
│           └── Delete Button
└── Toast (floating)
    ├── Icon
    ├── Message
    └── Auto-dismiss
```

---

## API Request/Response Examples

### 1. Create Custom Availability

**Request:**
```
POST /availability/custom
Authorization: Bearer eyJhbGc...

{
  "date": "2026-04-20",
  "slots": [
    { "startTime": "09:00", "endTime": "10:00" },
    { "startTime": "10:30", "endTime": "11:30" }
  ],
  "slotDuration": 30
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "interviewer": "507f1f77bcf86cd799439001",
  "type": "custom",
  "date": "2026-04-20T00:00:00.000Z",
  "slots": [
    {
      "startTime": "09:00",
      "endTime": "10:00",
      "isBooked": false,
      "bookedBy": null
    },
    {
      "startTime": "10:30",
      "endTime": "11:30",
      "isBooked": false,
      "bookedBy": null
    }
  ],
  "slotDuration": 30,
  "isActive": true,
  "createdAt": "2026-04-12T10:30:00.000Z",
  "updatedAt": "2026-04-12T10:30:00.000Z"
}
```

### 2. Get All Availabilities

**Request:**
```
GET /availability/my-availabilities
Authorization: Bearer eyJhbGc...
```

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "type": "recurring",
    "dayOfWeek": 1,
    "slots": [
      { "startTime": "09:00", "endTime": "17:00", "isBooked": false }
    ],
    "slotDuration": 60,
    "isActive": true
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "type": "custom",
    "date": "2026-04-20T00:00:00.000Z",
    "slots": [
      { "startTime": "09:00", "endTime": "10:00", "isBooked": false },
      { "startTime": "10:30", "endTime": "11:30", "isBooked": false }
    ],
    "slotDuration": 30,
    "isActive": true
  }
]
```

### 3. Get Available Slots for Date

**Request:**
```
GET /availability/slots?interviewerId=507f1f77bcf86cd799439001&date=2026-04-20
```

**Response (200 OK):**
```json
[
  "09:00",
  "10:30"
]
```

### 4. Delete Availability

**Request:**
```
DELETE /availability/507f1f77bcf86cd799439011
Authorization: Bearer eyJhbGc...
```

**Response (200 OK):**
```json
{
  "message": "Availability deleted"
}
```

---

## Error Scenarios

### Frontend Error Handling

```
User tries to save without date
    ↓
Validation fails
    ↓
Show error toast: "Please select a date"
    ↓
Form remains open, user can fix

───────────────────────────────────────

User tries to save with empty time slots
    ↓
Validation fails
    ↓
Show error toast: "Please fill all time slots"
    ↓
Form remains open, user can fix

───────────────────────────────────────

API request fails (network error)
    ↓
Catch error in try-catch
    ↓
Show error toast: "Error saving availability"
    ↓
Form remains open, user can retry
```

---

## Loading States

```
Button States:

Normal:
┌──────────────────────────────┐
│ Save Custom Availability     │
└──────────────────────────────┘

Loading:
┌──────────────────────────────┐
│ Saving... (disabled)         │
└──────────────────────────────┘
(Opacity reduced, click disabled)

Success (after):
Toast appears → Form clears → List updates
```

---

## Mobile Responsive Layout

### Desktop (> 1024px)
```
Two-column layout (form left, list right)
```

### Tablet (768px - 1024px)
```
Still two columns, narrower
Slight padding reduction
```

### Mobile (< 768px)
```
Single column (stacked)
Form on top
List below
Wider touch targets
Larger padding
```

---

## Color Scheme

```
Primary Colors:
├── Background: #0f172a (dark blue)
├── Surface: #1e293b (slightly lighter blue)
├── Text: #ffffff (white)
└── Text Secondary: #9ca3af (gray)

Accent Colors:
├── Success: #10b981 (emerald)
├── Error: #ef4444 (red)
├── Warning: #f59e0b (amber)
├── Info: #3b82f6 (blue)
└── Border: #4b5563 (dark gray)

Button States:
├── Primary: from-emerald-400 to-teal-500
├── Secondary: bg-gray-700
├── Danger: bg-red-600
└── Info: bg-blue-600
```

---

## Event Flow Timeline

```
T0: Page Load
├── Component mounts
└── fetchAvailabilities() called

T1: API Response
├── availabilities fetched
└── Rendered in list

T2: User fills form
├── State updated as typing
└── Form validation on submit

T3: User clicks Save
├── Frontend validation runs
├── If valid → API request
├── If invalid → Toast error

T4: API Processing
├── Backend validation
├── Database upsert
└── Response sent

T5: Response Received
├── Success → Toast + Form clear + List refresh
└── Error → Toast with message

T6: Toast Auto-dismiss
└── After 3 seconds, toast removed
```

---

## User Journey Map

### Interviewer Setting Custom Availability

```
DESIRE: "I want to be available on a specific day"
   ↓
ACTION: Navigate to Set Availability
   ↓
ACTION: Click "Custom (Specific Dates)" tab
   ↓
ACTION: Select a date (April 20)
   ↓
ACTION: Add time slots:
        09:00-10:00, 10:30-11:30, 14:00-15:00
   ↓
ACTION: Set duration (30 minutes)
   ↓
ACTION: Click "Save Custom Availability"
   ↓
FEELING: Anticipation (is it saving?)
   ↓
RESULT: Success toast! ✅
   ↓
VERIFICATION: See in list → "Apr 20, 2026"
   ↓
SATISFACTION: ✓ Availability set successfully
```

### Interviewee Booking Custom Availability

```
DESIRE: "I want to book with this interviewer on April 20"
   ↓
ACTION: Select interviewer
   ↓
ACTION: Select date (April 20)
   ↓
SYSTEM: Checks availability
   ├── Finds custom availability for April 20
   └── Generates slots based on custom slots
   ↓
ACTION: System shows available slots
   ├── 09:00 ✓
   ├── 10:30 ✓
   └── 14:00 ✓
   ↓
ACTION: Select 10:30 AM
   ↓
ACTION: Confirm booking
   ↓
RESULT: Booking confirmed! ✅
   ↓
SATISFACTION: ✓ Successfully booked
```

---

This visual guide complements the technical documentation and provides a comprehensive understanding of the feature's structure and behavior.
