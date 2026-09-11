# GeoAttend — Map Integration & Attendance Storage

## 1. Objective

GPS tracking is already implemented.

The next task is to implement:

1. React Native Map integration
2. Live user location on the map
3. Recruiter's office location on the map
4. 100-meter geofence visualization
5. Zustand attendance store
6. AsyncStorage persistence
7. Store hydration
8. Offline local data support

The office location is fixed for this assignment and will be configured directly in the application.

---

# 2. Important Assignment Decision

The recruiter's office location is known.

Therefore, the office latitude and longitude will be **hardcoded as application configuration**.

They should not be detected dynamically from the user's current location.

Use a single configuration file:

```text
src/constants/location.ts
```

Example:

```ts
export const OFFICE_LOCATION = {
  latitude: OFFICE_LATITUDE,
  longitude: OFFICE_LONGITUDE,
};

export const GEOFENCE_RADIUS = 100;
```

Replace:

```text
OFFICE_LATITUDE
OFFICE_LONGITUDE
```

with the actual recruiter office coordinates.

For example:

```ts
export const OFFICE_LOCATION = {
  latitude: 26.123456,
  longitude: 75.123456,
};

export const GEOFENCE_RADIUS = 100;
```

The actual coordinates should be the coordinates of the recruiter's office.

---

# 3. Why the Office Location Is Hardcoded

The assignment requires a:

```text
Fixed Office Location
```

with:

```text
100 meter radius
```

Therefore, dynamic office detection is unnecessary.

The office location should be:

```text
Fixed configuration
        ↓
OFFICE_LOCATION
        ↓
Used by:
    ├── Map
    ├── Geofence
    └── Attendance
```

This also makes the location easy to change later without modifying business logic.

---

# 4. Architecture

The architecture after this task should be:

```text
                 Permission
                     ↓
                GPS Tracking
                     ↓
              Current Location
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
        Map                  Geofence
          │                     │
          │                     ▼
          │                  Distance
          │                     │
          │                     ▼
          │                 Attendance
          │                     │
          │                     ▼
          │             Zustand Attendance
          │                     │
          │                     ▼
          │                AsyncStorage
          │
          ▼
    User + Office + Circle
```

---

# 5. File Structure

Use:

```text
src/
├── components/
│   └── AttendanceMap.tsx
│
├── constants/
│   └── location.ts
│
├── hooks/
│   └── useLocation.ts
│
├── stores/
│   └── attendanceStore.ts
│
└── types/
    └── attendance.ts
```

The exact existing project structure may differ, but keep these responsibilities separate.

---

# 6. Package Installation

Install React Native Maps:

```bash
npm install react-native-maps
```

Install AsyncStorage:

```bash
npm install @react-native-async-storage/async-storage
```

Install Zustand if it has not already been installed:

```bash
npm install zustand
```

For iOS:

```bash
cd ios
pod install
cd ..
```

Verify:

```bash
npx tsc --noEmit
```

---

# 7. Location Constants

Create:

```text
src/constants/location.ts
```

Example:

```ts
export const OFFICE_LOCATION = {
  latitude: 26.123456,
  longitude: 75.123456,
};

export const GEOFENCE_RADIUS = 100;
```

Add a comment explaining the source:

```ts
// Fixed office location provided for the technical assignment.
export const OFFICE_LOCATION = {
  latitude: 26.123456,
  longitude: 75.123456,
};

export const GEOFENCE_RADIUS = 100;
```

Do not duplicate these coordinates anywhere else.

---

# 8. Single Source of Truth

All features must use:

```ts
OFFICE_LOCATION;
```

and:

```ts
GEOFENCE_RADIUS;
```

Correct:

```text
location.ts
     ↓
Map
     ↓
Geofence
     ↓
Attendance
```

Incorrect:

```text
Map → hardcoded coordinates

Geofence → different hardcoded coordinates

Attendance → another hardcoded coordinate
```

There must be only one office configuration.

---

# 9. Map Component

Create:

```text
src/components/AttendanceMap.tsx
```

The component should use:

```text
react-native-maps
```

and render:

```text
MapView
    ├── User Marker
    ├── Office Marker
    └── Office Circle
```

The map should consume:

```text
useLocation()
```

for the user's current position.

The map must **not** create its own GPS watcher.

---

# 10. Map Data Flow

```text
useLocation()
      ↓
currentLocation
      ↓
AttendanceMap
      ↓
MapView
```

The same location should eventually be used by:

```text
Geofence
Attendance
```

This prevents multiple parts of the application from maintaining different location values.

---

# 11. User Location

When GPS provides a valid location:

```text
currentLocation
```

should be displayed on the map.

Conceptually:

```text
          👤
       User
```

The marker should update whenever the GPS hook receives a new valid position.

Do not create another location watcher.

---

# 12. Office Marker

The office marker must use:

```ts
OFFICE_LOCATION;
```

Example:

```tsx
<Marker
  coordinate={OFFICE_LOCATION}
  title="Office"
  description="GeoAttend office location"
/>
```

This marker represents the fixed attendance location.

---

# 13. Office Geofence Circle

Display a circle around the office:

```tsx
<Circle center={OFFICE_LOCATION} radius={GEOFENCE_RADIUS} />
```

The radius must be:

```text
100 meters
```

The circle is a **visual representation only**.

It does not determine whether attendance is allowed.

---

# 14. Map and Geofence Separation

The map answers:

```text
Where is the user?
Where is the office?
What does the 100m boundary look like?
```

The geofence logic answers:

```text
How far is the user from the office?
Is the user inside 100m?
```

Therefore:

```text
Circle
  ≠
Geofence validation
```

The actual distance calculation will be implemented in the next task.

---

# 15. Initial Map Position

When the application starts, GPS may not immediately have a location.

Therefore:

```text
GPS unavailable initially
        ↓
Show map around office
```

Once a valid user location is received:

```text
User location available
        ↓
Display user marker
        ↓
Optionally center map around user
```

Do not continuously force the camera to the user's location on every GPS update.

The user should be able to manually move the map.

---

# 16. Map States

The map should support these situations.

### Location loading

```text
Map
+
Getting your location...
```

### Location available

```text
Map
+
User marker
+
Office marker
+
100m circle
```

### Location unavailable

```text
Map
+
Office marker
+
100m circle

Location unavailable
```

The map should not disappear just because GPS temporarily fails.

---

# 17. Invalid Coordinates

Never render invalid coordinates.

Reject values such as:

```text
NaN
undefined
null
invalid latitude
invalid longitude
```

before passing them to:

```text
Marker
```

or:

```text
MapView
```

---

# 18. Map Camera Edge Cases

Handle:

- Initial location unavailable
- First valid location received
- Multiple location updates
- User manually moves the map
- GPS temporarily fails
- Invalid GPS coordinates
- Map loading
- Map provider failure

Avoid:

```text
Every GPS update
      ↓
animateToRegion()
```

because this can prevent the user from manually exploring the map.

---

# 19. Offline Map Behavior

Internet and GPS are different.

Example:

```text
Internet = OFF
GPS = ON
Permission = GRANTED
```

The application may still receive GPS coordinates.

Therefore:

```text
Offline
   ↓
GPS tracking can continue
```

However, map tiles may not be available without network access depending on the platform/provider and cached map data.

This should not be treated as a GPS error.

---

# 20. Zustand Attendance Store

Create:

```text
src/stores/attendanceStore.ts
```

The store is responsible for historical attendance data.

It should eventually contain:

```text
records
addAttendance()
hasCheckedInToday()
clearAttendance()
```

The store should not know about:

```text
GPS
MapView
Permissions
Navigation
```

---

# 21. Attendance Type

Create:

```text
src/types/attendance.ts
```

Suggested structure:

```ts
export interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string;
  latitude: number;
  longitude: number;
  distanceFromOffice: number;
  status: 'checked_in';
}
```

This represents one successful attendance record.

---

# 22. Attendance Store State

Conceptually:

```text
AttendanceStore
│
├── records
│
├── addAttendance()
│
├── hasCheckedInToday()
│
└── clearAttendance()
```

Example:

```text
records:
[
  {
    id: "...",
    date: "2026-09-11",
    checkInTime: "...",
    latitude: 26.xxxx,
    longitude: 75.xxxx,
    distanceFromOffice: 42,
    status: "checked_in"
  }
]
```

---

# 23. AsyncStorage Persistence

Use Zustand's `persist` middleware with AsyncStorage.

Architecture:

```text
useAttendanceStore
       ↓
persist middleware
       ↓
AsyncStorage
```

Only attendance records should be persisted.

Do not persist:

```text
currentLocation
isTracking
loading
GPS errors
map state
```

Those are temporary runtime states.

---

# 24. Storage Key

Use a dedicated key:

```text
geoattend-attendance
```

Do not use generic storage keys.

Example:

```ts
name: 'geoattend-attendance';
```

---

# 25. Persisted State

Persist:

```text
records
```

Do not persist:

```text
isLoading
isTracking
currentLocation
error
```

Conceptually:

```text
Runtime State
├── currentLocation
├── tracking
└── error

Persistent State
└── attendanceRecords
```

---

# 26. Store Hydration

When the app starts:

```text
App starts
    ↓
Zustand initializes
    ↓
AsyncStorage loads records
    ↓
Store hydrates
    ↓
Attendance records available
```

Because AsyncStorage is asynchronous, the store may not immediately contain the persisted records.

Expose a hydration state if the application UI needs to know when data is ready.

Conceptually:

```ts
hasHydrated: boolean;
```

---

# 27. Hydration Edge Case

Avoid:

```text
App starts
    ↓
records = []
    ↓
Show "No attendance"
    ↓
Storage loads
    ↓
Records suddenly appear
```

Prefer:

```text
App starts
    ↓
Hydrating...
    ↓
Storage loaded
    ↓
Show records
```

---

# 28. Add Attendance

The store should provide:

```text
addAttendance(record)
```

However, **do not connect it to the Check In button yet**.

The final flow will be implemented in the next task:

```text
Check In
   ↓
Get latest location
   ↓
Calculate distance
   ↓
Distance <= 100m?
   ↓
Already checked in today?
   ↓
Create record
   ↓
Zustand
   ↓
AsyncStorage
```

---

# 29. Duplicate Attendance

The store should eventually provide:

```text
hasCheckedInToday()
```

This will prevent multiple attendance records for the same day.

Example:

```text
Today
  ↓
Already checked in?
  │
  ├── YES → Reject
  │
  └── NO  → Allow
```

The final UI behavior belongs to the attendance task.

---

# 30. Offline Storage

Attendance must work without internet.

Example:

```text
Internet ❌
GPS      ✅
Permission ✅
```

Expected:

```text
Check-in
   ↓
Attendance record
   ↓
Zustand
   ↓
AsyncStorage
```

No backend is required.

The data remains on the device.

---

# 31. Storage Error

Storage operations should fail gracefully.

Do not allow a storage error to crash the application.

Conceptually:

```text
Save attendance
      ↓
AsyncStorage error
      ↓
Handle error
      ↓
Show appropriate message
```

Do not scatter storage `try/catch` logic throughout the UI.

Keep storage behavior inside the store/persistence layer.

---

# 32. App Restart Test

This is a required test.

```text
App
 ↓
Create test attendance
 ↓
Close application
 ↓
Open application
 ↓
Hydrate Zustand
 ↓
Attendance still exists
```

The record must survive application restart.

---

# 33. Data Integrity

An attendance record should preserve:

```text
Date
Check-in time
Latitude
Longitude
Distance from office
Status
```

The coordinates should represent the user's location at the time of check-in, not the current location after the user moves.

---

# 34. Map + Store Independence

The map and attendance store should remain independent.

```text
AttendanceMap
    ↓
useLocation
```

and:

```text
AttendanceStore
    ↓
AsyncStorage
```

They should not directly depend on each other.

Later, attendance logic will combine them:

```text
Location
    +
Office Location
    ↓
Geofence
    ↓
Attendance
    ↓
AttendanceStore
```

---

# 35. Testing Scenarios

## Scenario 1 — GPS Available

```text
Permission granted
GPS enabled
Location available
```

Expected:

```text
User marker visible
Office marker visible
100m circle visible
```

---

## Scenario 2 — GPS Loading

```text
Permission granted
GPS enabled
No location yet
```

Expected:

```text
Office marker visible
100m circle visible
User marker hidden
"Getting location..."
```

---

## Scenario 3 — GPS Error

```text
Permission granted
GPS unavailable
```

Expected:

```text
Map remains visible
Office marker remains visible
Location error shown
```

---

## Scenario 4 — Offline

```text
Internet OFF
GPS ON
```

Expected:

```text
GPS can continue providing location
Local storage remains available
No network error should be treated as GPS failure
```

---

## Scenario 5 — Inside Office

Simulate a location near the office:

```text
Office
  📍
   |
   | 50m
   |
   👤
```

Expected:

```text
User location available
Distance can later be calculated as approximately 50m
```

---

## Scenario 6 — Outside Office

Simulate:

```text
Office
  📍
   |
   | 150m
   |
   👤
```

Expected:

```text
Location available
Distance can later be calculated as approximately 150m
```

---

## Scenario 7 — App Restart

```text
Attendance record
      ↓
Close app
      ↓
Open app
      ↓
Hydrate
```

Expected:

```text
Record still exists
```

---

## Scenario 8 — Multiple Store Actions

```text
addAttendance()
addAttendance()
```

The store should maintain valid records.

Duplicate daily attendance enforcement will be finalized in the attendance task.

---

# 36. Testing the Recruiter's Office

Because the recruiter's office coordinates are known:

```text
src/constants/location.ts
```

contains the actual office coordinates.

You do not need to physically visit the office for testing.

Use:

```text
iOS Simulator
```

or:

```text
Android Emulator
```

to simulate different GPS positions.

---

# 37. Testing Location Near Office

Use the recruiter's actual office coordinates:

```text
OFFICE_LOCATION
```

Then simulate a location:

```text
Inside 100m
```

Example:

```text
Office
  📍
   |
   | ~50m
   |
   👤
```

The future geofence logic should classify this as:

```text
INSIDE
```

---

# 38. Testing Location Outside Office

Simulate a location more than 100m away:

```text
Office
  📍
   |
   |
   | ~150m
   |
   👤
```

The future geofence logic should classify this as:

```text
OUTSIDE
```

---

# 39. Testing the Boundary

The important cases are:

```text
50m   → Inside
99m   → Inside
100m  → Inside
101m  → Outside
```

The final implementation should explicitly define whether the boundary is inclusive.

Recommended:

```text
distance <= 100m
```

means:

```text
INSIDE
```

---

# 40. Testing on a Physical Device

Simulator/emulator testing is useful, but final testing should also be done on a physical device when possible.

Test:

```text
Permission
GPS
Location updates
Map
Storage
```

Real GPS accuracy can differ from simulated location.

---

# 41. Edge Case Checklist

## Map

- [ ] Map loads
- [ ] Office marker appears
- [ ] User marker appears
- [ ] User marker updates
- [ ] Invalid coordinates are rejected
- [ ] Initial map region works
- [ ] Camera does not constantly move
- [ ] GPS error doesn't crash the map
- [ ] Map works gracefully when network is unavailable

## Office Configuration

- [ ] Recruiter office coordinates are correct
- [ ] Coordinates exist in one file
- [ ] No duplicate hardcoded coordinates
- [ ] Geofence radius is 100m
- [ ] Map uses `OFFICE_LOCATION`
- [ ] Future geofence uses `OFFICE_LOCATION`

## Zustand

- [ ] Attendance store initializes
- [ ] Records can be added
- [ ] Records can be read
- [ ] Daily attendance helper exists
- [ ] Store does not access GPS
- [ ] Store does not access MapView

## AsyncStorage

- [ ] Records persist
- [ ] Records survive restart
- [ ] Hydration is handled
- [ ] Only attendance data is persisted
- [ ] Storage failure is handled
- [ ] Offline storage works

---

# 42. Definition of Done

This task is complete when:

- [ ] `react-native-maps` is installed
- [ ] AsyncStorage is installed
- [ ] Zustand is installed/available
- [ ] Recruiter office coordinates are configured
- [ ] Office coordinates are centralized
- [ ] 100m radius is centralized
- [ ] Map renders
- [ ] Office marker renders
- [ ] User location renders
- [ ] User location updates
- [ ] 100m circle renders
- [ ] Map does not create a second GPS watcher
- [ ] Attendance type exists
- [ ] Attendance store exists
- [ ] Attendance can be added to the store
- [ ] Attendance persists through AsyncStorage
- [ ] Store hydration works
- [ ] Attendance survives app restart
- [ ] Offline storage works
- [ ] TypeScript passes
- [ ] No geofence calculation yet
- [ ] No check-in logic yet

---

# 43. Git Commit Plan

Keep the work separated.

## Commit 1 — Dependencies

```bash
git add .
git commit -m "feat: add map and storage dependencies"
```

## Commit 2 — Office Configuration

```bash
git add .
git commit -m "feat: configure office location"
```

## Commit 3 — Map

```bash
git add .
git commit -m "feat: add attendance map"
```

## Commit 4 — Geofence Visualization

```bash
git add .
git commit -m "feat: display office geofence"
```

## Commit 5 — Attendance Type

```bash
git add .
git commit -m "feat: define attendance record"
```

## Commit 6 — Zustand Store

```bash
git add .
git commit -m "feat: add attendance store"
```

## Commit 7 — Persistence

```bash
git add .
git commit -m "feat: persist attendance records"
```

If an actual bug is found, create a separate fix commit:

```bash
git add .
git commit -m "fix: handle attendance storage hydration"
```

Do not combine unrelated fixes into feature commits.

---

# 44. Final State After This Task

```text
Permission
    ↓
GPS Tracking
    ↓
Current Location
    │
    ├───────────────┐
    ↓               ↓
   Map          Geofence
    │               │
    ↓               ↓
Office + User    Distance
+ 100m Circle       │
                    ↓
                Attendance
                    ↓
              Zustand Store
                    ↓
               AsyncStorage
```

At this point, the application will know:

```text
Where is the user?
Where is the office?
What does the 100m boundary look like?
What attendance records are stored?
```

But it will **not yet decide whether the user can check in**.

That is intentionally the next task.

---

# 45. Next Task

The next task will implement:

```text
Current Location
       ↓
Calculate distance from
recruiter office
       ↓
distance <= 100m?
       │
   ┌───┴────┐
   │        │
  YES       NO
   │        │
   ▼        ▼
Inside    Outside
   │        │
   ▼        ▼
Enable    Disable
Check In  Check In
```

Then:

```text
Check In
   ↓
Validate location
   ↓
Validate accuracy
   ↓
Validate 100m geofence
   ↓
Check today's attendance
   ↓
Create AttendanceRecord
   ↓
Zustand
   ↓
AsyncStorage
```

That task will contain the actual **geofence business logic + check-in functionality**.
