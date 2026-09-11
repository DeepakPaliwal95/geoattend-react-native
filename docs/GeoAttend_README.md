# GeoAttend

**Geolocation Tracking & Geofence-Based Attendance System**

GeoAttend is a React Native CLI application that demonstrates real-time location tracking and geofence-based attendance. The app displays the user's current location, shows a fixed office geofence with a **100-meter radius**, and allows attendance to be marked only when the user is inside that area.

---

## 📱 Features

- Real-time foreground GPS tracking
- Current user location on a map
- Fixed office location
- 100-meter geofence
- Check-in only when inside the geofence
- Local attendance persistence
- Attendance history
- Location permission handling
- GPS / Location Services disabled handling
- Offline support
- Poor GPS accuracy handling
- Location unavailable handling
- Duplicate check-in prevention

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| React Native CLI | Mobile application |
| TypeScript | Type safety |
| React Navigation | Navigation |
| Zustand | State management |
| `react-native-maps` | Map and geofence visualization |
| `react-native-geolocation-service` | GPS location tracking |
| `react-native-permissions` | Runtime permission handling |
| AsyncStorage | Local attendance persistence |

### Why not Keychain?

The assignment does not require authentication, passwords, tokens, or other secrets. Therefore, `react-native-keychain` is not required for the current scope.

If authentication is added later, Keychain would be appropriate for storing sensitive credentials or tokens.

---

# 🧭 Application Flow

```text
App Launch
    │
    ▼
Check Location Permission
    │
    ├── Not Granted
    │       │
    │       ▼
    │   Request Permission
    │       │
    │       ├── Granted ───────────┐
    │       │                      │
    │       └── Blocked → Settings │
    │                              │
    ▼                              ▼
Check Location Services
    │
    ├── Disabled
    │       │
    │       ▼
    │   GPS Disabled State
    │
    ▼
Start Location Tracking
    │
    ▼
Get Current GPS Location
    │
    ▼
Update Location Store
    │
    ▼
Calculate Distance From Office
    │
    ├── > 100m → Outside Geofence
    │
    └── ≤ 100m → Inside Geofence
                         │
                         ▼
                      Check In
                         │
                         ▼
                  Validate Location
                         │
                         ▼
                  Validate Accuracy
                         │
                         ▼
               Check Duplicate Record
                         │
                         ▼
                  Save Attendance
                         │
                         ▼
                 AsyncStorage + Zustand
```

---

# 📲 Screens

## 1. Home / Attendance

The primary screen contains:

- Map
- User location
- Office marker
- 100m geofence circle
- Distance from office
- Inside / Outside status
- Check-in button
- Offline indicator when applicable
- Bottom navigation

Example states:

### Outside

```text
Distance: 248 m
Status: Outside Office

You are outside the office area.
Move closer to check in.

[ Check In - Disabled ]
```

### Inside

```text
Distance: 42 m
Status: Inside Office

You are inside the office area.

[ Check In ]
```

### Already Checked In

```text
✓ Checked In

Today at 09:42 AM

[ Checked In - Disabled ]
```

---

## 2. Attendance History

History is a separate bottom-tab destination.

Each record should display:

- Date
- Check-in time
- Distance from office

Example:

```text
Today, 10 Sep 2026

✓ Checked In
09:42 AM                     42 m

─────────────────────────────

09 Sep 2026

✓ Checked In
09:37 AM                     56 m
```

If there are no records:

```text
No Attendance Records Yet

Your attendance history will appear
here after your first check-in.
```

---

## 3. Permission / Blocked States

The operating system provides the actual location permission dialog.

A custom application screen is useful for:

- Explaining why location is required
- Handling permanently blocked permission
- Providing an Open Settings action
- Giving the user a clear recovery path

The app should not show a custom permission screen every time before the system dialog.

---

## 4. GPS Disabled

Permission and GPS services are separate.

A user can grant location permission while Location Services are disabled.

In this situation:

```text
Location Services Disabled

Please enable Location Services (GPS)
to use GeoAttend.

[ Open Settings ]
[ Try Again ]
```

---

# 📍 Location Tracking

Location tracking runs while the application is active.

```text
Home Mounted
     ↓
startTracking()
     ↓
watchPosition()
     ↓
New Location
     ↓
Update Zustand
     ↓
Calculate Distance
     ↓
Update UI
     ↓
Home Unmounted
     ↓
stopTracking()
```

The watcher should be stopped when it is no longer needed to avoid unnecessary battery consumption and duplicate location subscriptions.

---

# 📐 Geofence Logic

The office location is fixed in the application configuration.

```ts
export const OFFICE_LOCATION = {
  latitude: YOUR_LATITUDE,
  longitude: YOUR_LONGITUDE,
};

export const GEOFENCE_RADIUS = 100;
```

The application calculates the geographical distance between:

- Current user location
- Office location

### Rule

```text
distance <= 100 meters
        ↓
     INSIDE
        ↓
Check-in allowed
```

```text
distance > 100 meters
        ↓
     OUTSIDE
        ↓
Check-in rejected
```

A dedicated distance utility should be used instead of putting the calculation directly inside the screen.

---

# 📝 Check-In Validation

When the user presses **Check In**, the application performs the following validation:

```text
Check In
   ↓
Location available?
   ├── No → Location error
   ↓
GPS accuracy acceptable?
   ├── No → Low accuracy message
   ↓
Distance <= 100m?
   ├── No → Check-in rejected
   ↓
Already checked in today?
   ├── Yes → Already checked-in message
   ↓
Create Attendance Record
   ↓
Persist locally
   ↓
Update Zustand
   ↓
Show success
```

---

# 💾 Attendance Data

Recommended model:

```ts
interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string;
  latitude: number;
  longitude: number;
  distanceFromOffice: number;
  status: 'checked_in';
}
```

Attendance records are persisted locally using AsyncStorage.

This ensures records remain available after:

- App restart
- App being killed
- Temporary internet loss

---

# 🧠 State Management

The application uses two Zustand stores.

## Location Store

Responsible for:

- Current latitude
- Current longitude
- GPS accuracy
- Location status
- Distance from office
- Geofence status
- Tracking lifecycle

```text
Location Service
       ↓
Location Store
       ↓
Home Screen
```

## Attendance Store

Responsible for:

- Attendance records
- Today's attendance
- Check-in operation
- Persistence
- History data

```text
Attendance Store
       ↓
Storage Service
       ↓
AsyncStorage
```

---

# 🗂 Project Structure

```text
src/
│
├── components/
│   ├── AttendanceButton.tsx
│   ├── AttendanceCard.tsx
│   ├── LocationStatus.tsx
│   └── MapView.tsx
│
├── constants/
│   └── location.ts
│
├── navigation/
│   └── AppNavigator.tsx
│
├── screens/
│   ├── HomeScreen.tsx
│   ├── HistoryScreen.tsx
│   ├── PermissionScreen.tsx
│   └── GPSErrorScreen.tsx
│
├── services/
│   └── locationService.ts
│
├── storage/
│   └── attendanceStorage.ts
│
├── stores/
│   ├── locationStore.ts
│   └── attendanceStore.ts
│
├── types/
│   ├── attendance.ts
│   └── location.ts
│
└── utils/
    ├── date.ts
    └── distance.ts
```

---

# 🧭 Navigation Decision

The app uses a simple **Bottom Tab Navigator**:

```text
┌──────────────────────────┐
│                          │
│        Home              │
│   Map + Check In         │
│                          │
├──────────────────────────┤
│   Home        History    │
└──────────────────────────┘
```

### Why Bottom Tabs?

There are only two primary features:

1. Home / Check In
2. Attendance History

Both are important destinations and can be accessed directly.

### Why no Drawer?

A drawer would add unnecessary navigation complexity for only two main screens.

### Why no Notification Icon?

There is no notification requirement or backend notification workflow in the assignment.

---

# 🌐 Offline Behavior

Internet and GPS are different dependencies.

The application does not require internet connectivity for its core functionality.

```text
Internet OFF
     +
GPS ON
     ↓
Location available
     ↓
Distance calculated locally
     ↓
Geofence works
     ↓
Attendance saved locally
```

Therefore, a user can check in while offline as long as a valid GPS location is available.

The UI should communicate that the record is being stored locally.

---

# 🎯 Edge Cases

| Scenario | Expected Behavior |
|---|---|
| Permission denied | Explain requirement and allow retry |
| Permission permanently blocked | Provide Open Settings |
| GPS disabled | Show GPS disabled state |
| Location unavailable | Show retry/loading state |
| Poor GPS accuracy | Prevent unreliable check-in |
| Outside 100m | Disable/reject check-in |
| Inside 100m | Allow check-in after validation |
| Already checked in | Prevent duplicate record |
| Internet unavailable | Continue using local GPS/storage |
| App restarted | Restore attendance history |
| No attendance | Show empty history state |

---

# 🔐 Background Location

Background location tracking is intentionally **not implemented**.

The assignment requires continuous location tracking but does not require:

- Automatic attendance
- Tracking while the app is closed
- Tracking while the app is backgrounded
- Automatic geofence entry detection

Therefore, location tracking is limited to the active application.

If a future requirement says:

> Automatically mark attendance when an employee enters the office, even when the app is closed.

Then background location / native geofencing would be required.

---

# 🎨 Design System

## Colors

| Token | Hex | Usage |
|---|---|---|
| Primary | `#2563EB` | Brand, buttons, active states |
| Secondary | `#3B82F6` | Highlights |
| Success | `#10B981` | Inside geofence, successful check-in |
| Danger | `#EF4444` | Errors, outside geofence |
| Warning | `#F59E0B` | Warnings, low accuracy |
| Text Primary | `#0F172A` | Main text |
| Text Secondary | `#64748B` | Supporting text |
| Background | `#F8FAFC` | Screen background |
| Border | `#E2E8F0` | Borders and dividers |

## Typography

Recommended:

- **Inter** where available
- iOS system font / SF Pro
- Android system font / Roboto

Suggested scale:

| Type | Size | Weight |
|---|---:|---|
| Heading | 24 | Bold |
| Section | 20 | Semibold |
| Title | 16 | Semibold |
| Body | 14 | Regular |
| Caption | 12 | Regular |

---

# 🧪 Testing Checklist

### Permissions

- [ ] Fresh installation
- [ ] Allow permission
- [ ] Deny permission
- [ ] Permanently block permission
- [ ] Open Settings
- [ ] Return from Settings

### GPS

- [ ] GPS enabled
- [ ] GPS disabled
- [ ] Location unavailable
- [ ] Poor accuracy
- [ ] Location updates continuously

### Geofence

- [ ] User outside 100m
- [ ] User inside 100m
- [ ] User near 100m boundary
- [ ] Distance updates correctly

### Attendance

- [ ] Successful check-in
- [ ] Duplicate check-in prevented
- [ ] Record persisted
- [ ] History displayed
- [ ] Empty history displayed
- [ ] Data survives app restart

### Offline

- [ ] Disable internet
- [ ] GPS remains available
- [ ] Check-in works
- [ ] Attendance persists locally

---

# 🚀 Implementation Order

Recommended development sequence:

1. Create React Native CLI project.
2. Configure TypeScript.
3. Install navigation and required libraries.
4. Create the navigation structure.
5. Build the Home and History UI.
6. Implement permission handling.
7. Implement GPS/location service.
8. Create `locationStore`.
9. Integrate the map.
10. Add office marker and 100m circle.
11. Implement distance calculation.
12. Implement geofence state.
13. Create attendance model.
14. Create AsyncStorage service.
15. Create `attendanceStore`.
16. Implement check-in validation.
17. Implement duplicate prevention.
18. Build History screen.
19. Handle offline and error states.
20. Test all edge cases.
21. Polish UI and prepare submission.

---

# 📦 Final Scope

```text
Screens
├── Home
├── History
├── Permission / blocked state
└── GPS / location error states

State
├── LocationStore
└── AttendanceStore

Services
├── LocationService
└── AttendanceStorage

Core Logic
├── GPS tracking
├── Distance calculation
├── 100m geofence
├── Check-in validation
└── Local persistence
```

The goal is to keep the assignment focused while demonstrating clean React Native architecture, correct location handling, state management, persistence, and real-world edge-case handling.
