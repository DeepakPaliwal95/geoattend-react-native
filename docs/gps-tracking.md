# GeoAttend — GPS Tracking

## 1. Objective

Implement foreground GPS tracking using:

```text
react-native-geolocation-service
```

The GPS feature is responsible only for obtaining and maintaining the user's current location.

It should provide:

- Current latitude
- Current longitude
- GPS accuracy
- Location timestamp
- Tracking status
- Location errors
- Start tracking
- Stop tracking
- Proper cleanup

This feature should **not** contain:

- Geofence calculation
- Map rendering
- Attendance logic
- Attendance storage
- Internet connectivity logic

Those features will consume the location provided by this layer.

---

# 2. Architecture

```text
Permission
    ↓
useLocation
    ↓
location.ts
    ↓
react-native-geolocation-service
    ↓
Native GPS
```

Recommended files:

```text
src/
├── hooks/
│   └── useLocation.ts
│
└── utils/
    └── location.ts
```

### `location.ts`

Responsible for communicating with:

```text
react-native-geolocation-service
```

It should contain functions such as:

```text
getCurrentLocation()
startLocationTracking()
stopLocationTracking()
```

It should not contain React state.

---

### `useLocation.ts`

Responsible for:

```text
current location
tracking state
loading state
error state
start tracking
stop tracking
cleanup
```

The UI should consume the hook instead of directly using the native library.

---

# 3. Location Data

The application should normalize the native location response into a simple object.

Conceptually:

```ts
interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}
```

Additional native values such as:

```text
altitude
speed
heading
```

can be retained later if required, but they are not required for the assignment.

---

# 4. Tracking States

The hook should expose a predictable tracking state.

```ts
type LocationStatus = 'idle' | 'starting' | 'tracking' | 'error';
```

Meaning:

### `idle`

Tracking has not started.

```text
No active GPS watcher
```

### `starting`

The application has requested tracking but has not received the first valid location yet.

```text
Starting GPS...
```

### `tracking`

A valid location is being received.

```text
GPS Active
```

### `error`

The location service encountered an error.

```text
Location unavailable
```

---

# 5. Initial Flow

The complete GPS flow is:

```text
Permission Granted
        ↓
Start Location Tracking
        ↓
GPS watcher created
        ↓
Wait for location
        ↓
Location received
        ↓
Validate location
        ↓
Update useLocation state
        ↓
UI receives latest location
```

---

# 6. Permission Dependency

GPS tracking must not start if location permission has not been granted.

Expected flow:

```text
Permission
    │
    ├── Not granted
    │       ↓
    │   Do not start GPS
    │
    └── Granted
            ↓
        Start GPS
```

The location layer should assume that the permission flow has already been handled.

Do not duplicate the complete permission UI inside `useLocation`.

---

# 7. Start Tracking

When tracking starts:

```text
idle
 ↓
starting
 ↓
create watcher
 ↓
receive location
 ↓
tracking
```

The watcher should continuously provide updated positions as the device position changes.

A watcher returns an identifier that must be retained so that it can later be cleared.

Conceptually:

```ts
const watchId = Geolocation.watchPosition(
  successCallback,
  errorCallback,
  options,
);
```

Store the watcher ID internally.

---

# 8. Stop Tracking

When tracking is no longer required:

```text
tracking
    ↓
stopTracking()
    ↓
clear watcher
    ↓
idle
```

The watcher must be cleared when:

- The hook unmounts
- Tracking is explicitly stopped
- The user leaves the relevant screen if the architecture chooses screen-based tracking
- A new watcher is started and an existing watcher already exists

Do not create multiple watchers accidentally.

---

# 9. Duplicate Watcher Protection

This is an important edge case.

Bad:

```text
startTracking()
startTracking()
startTracking()
```

could create:

```text
Watcher 1
Watcher 2
Watcher 3
```

This can cause:

- Duplicate callbacks
- Increased battery usage
- Unnecessary native work
- Difficult cleanup

Expected behavior:

```text
startTracking()
    ↓
Watcher 1

startTracking()
    ↓
Already tracking
    ↓
Do nothing
```

Only one active watcher should exist.

---

# 10. First Location

There may be a delay between starting tracking and receiving the first GPS location.

Therefore:

```text
starting
```

must not be treated as:

```text
location unavailable
```

UI can show:

```text
Getting your location...
```

until the first valid location arrives.

---

# 11. Location Update

Every valid update should replace the previous location:

```text
Location #1
    ↓
Location #2
    ↓
Location #3
    ↓
Location #4
```

The hook should always expose the latest valid location.

Example:

```text
latitude: 26.xxxxx
longitude: 76.xxxxx
accuracy: 12m
timestamp: ...
```

---

# 12. Invalid Location Data

Do not blindly update state with malformed coordinates.

Reject a location if:

```text
latitude is missing
OR
longitude is missing
OR
latitude is NaN
OR
longitude is NaN
OR
accuracy is invalid
```

Conceptually:

```text
Native Location
      ↓
Validate
      │
      ├── Invalid → Ignore
      │
      └── Valid → Update state
```

---

# 13. GPS Accuracy

Accuracy is extremely important because the assignment uses a:

```text
100 meter geofence
```

A location with very poor accuracy can make a boundary decision unreliable.

Example:

```text
User distance from office = 90m
GPS accuracy = 150m
```

We should not confidently say:

```text
User is inside
```

because the uncertainty is larger than the geofence boundary.

For the first GPS task:

```text
Store accuracy
```

but do not implement the final geofence accuracy rule yet.

The geofence task will define the exact threshold.

---

# 14. Stale Location

A location can be older than expected.

Example:

```text
Current time
    ↓
Location timestamp from several minutes ago
```

The application should be able to identify stale data.

For now:

```text
LocationData.timestamp
```

must always be stored.

The geofence/attendance layer can later decide whether a location is fresh enough for check-in.

---

# 15. GPS Disabled

Permission and GPS availability are different.

Example:

```text
Permission = GRANTED
GPS = OFF
```

The user has allowed GeoAttend to access location, but the device's location service is disabled.

Expected behavior:

```text
Start Tracking
      ↓
GPS unavailable
      ↓
Error callback
      ↓
Location status = error
```

The UI should communicate:

```text
Location unavailable

Please enable Location Services
to continue.
```

Do not show the permission screen again.

---

# 16. Permission Revoked While Tracking

Possible scenario:

```text
GPS tracking
    ↓
User opens Settings
    ↓
Revokes location permission
    ↓
Returns to app
```

Expected behavior:

```text
Tracking detects failure
       ↓
Stop watcher
       ↓
Permission layer re-checks permission
       ↓
Permission UI if required
```

The GPS layer should not assume permission remains permanently available.

---

# 17. App Goes to Background

For this assignment, the initial implementation should focus on:

```text
Foreground tracking
```

The assignment does not require background location tracking.

Therefore:

```text
App Open
    ↓
Tracking active
```

is required.

We do not need to implement:

```text
App closed
    ↓
Background GPS tracking
```

unless the assignment requirements are later expanded.

The `react-native-geolocation-service` ecosystem has discussions around background/screen-locked behavior, which reinforces that background tracking should be treated as a separate requirement rather than assumed from foreground watching.

---

# 18. App Goes to Background Then Returns

Expected behavior:

```text
Home
 ↓
GPS tracking
 ↓
App background
 ↓
App foreground
 ↓
Location still available?
```

If tracking has stopped or become invalid:

```text
Restart tracking
```

The exact AppState strategy can be implemented in the hook.

Do not create a second watcher without clearing the previous one.

---

# 19. GPS Timeout

The native location request can fail because a location isn't obtained within the configured timeout.

Expected:

```text
GPS request
    ↓
Timeout
    ↓
Location error
```

The UI should not crash.

It should show a recoverable state:

```text
Unable to get your location.

[ Try Again ]
```

A timeout should not automatically mean:

```text
Permission denied
```

These are different errors.

---

# 20. Location Error Handling

Normalize native errors into application-level errors.

Possible categories:

```text
permission_denied
position_unavailable
timeout
unknown
```

Conceptually:

```ts
type LocationError =
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'unknown';
```

The UI can then decide what message to display.

---

# 21. Error Recovery

Location errors should be recoverable.

Example:

```text
Location error
      ↓
Show error
      ↓
User taps Retry
      ↓
Restart location tracking
```

Do not continuously restart the watcher in a tight loop.

Avoid:

```text
error
 ↓
restart
 ↓
error
 ↓
restart
 ↓
error
```

This can waste battery and make debugging difficult.

---

# 22. Network / Offline

GPS does not require the application to have an internet connection for the basic location flow.

Therefore:

```text
Internet ❌
GPS     ✅
Permission ✅
```

should still allow location coordinates to be obtained when the device's location services can provide them.

Expected:

```text
Offline
  ↓
GPS works
  ↓
Location updates normally
```

Do not treat:

```text
offline
```

as:

```text
GPS unavailable
```

Offline attendance storage will be handled later.

---

# 23. Emulator / Simulator

Testing GPS on an emulator/simulator can behave differently from a physical device.

Possible scenario:

```text
Permission granted
GPS configured incorrectly
      ↓
No location update
```

Do not immediately assume the application implementation is broken.

For development:

- Configure a simulated location
- Test on a physical device when possible
- Verify location permissions
- Verify device Location Services

There are also reported cases where Android emulator configurations result in `watchPosition`/current-position calls not producing a location despite permissions being granted.

---

# 24. Cached Location

A location provider may return a previously obtained position depending on configuration.

The implementation should configure location requests deliberately rather than blindly accepting stale cached data.

The location timestamp should always be retained so later layers can determine whether a location is sufficiently fresh.

---

# 25. Battery Consideration

Continuous GPS tracking consumes more battery than a one-time location request.

Therefore:

```text
Start tracking
    ↓
Only when required
```

and:

```text
Stop tracking
    ↓
When no longer required
```

The application should not keep a GPS watcher alive unnecessarily.

For the assignment:

```text
Foreground tracking
+
single watcher
+
proper cleanup
```

is sufficient.

---

# 26. Multiple Components Using Location

Avoid having multiple components independently call:

```text
watchPosition()
```

For example, this is undesirable:

```text
HomeScreen
   ↓
watchPosition()

MapView
   ↓
watchPosition()

AttendanceButton
   ↓
watchPosition()
```

Instead:

```text
useLocation
     ↓
single location source
     ↓
Home
 ├── Map
 ├── Location status
 └── Attendance
```

This ensures all features use the same latest location.

---

# 27. Map Integration Dependency

The GPS layer should not know anything about the map.

Correct:

```text
useLocation
     ↓
currentLocation
     ↓
MapView
```

Incorrect:

```text
useLocation
     ↓
react-native-maps
```

The map is a consumer of location data.

---

# 28. Geofence Dependency

The GPS layer should also not calculate the geofence.

Correct:

```text
useLocation
     ↓
currentLocation
     ↓
Geofence Utility
     ↓
distance
     ↓
inside/outside
```

Incorrect:

```text
useLocation
     ↓
distance <= 100
```

The location feature should only answer:

```text
Where is the user?
```

The geofence feature will answer:

```text
Is the user inside the office boundary?
```

---

# 29. Attendance Dependency

Attendance should consume the latest valid location.

```text
Location
   ↓
Geofence
   ↓
Inside?
   ↓
Attendance
```

Attendance should not directly call:

```text
watchPosition()
```

or:

```text
getCurrentPosition()
```

unless we deliberately introduce a separate final-position validation later.

---

# 30. Complete GPS State Flow

```text
                 Permission Granted
                         │
                         ▼
                 Start Tracking
                         │
                         ▼
                     Starting
                         │
              ┌──────────┴──────────┐
              │                     │
       Location Received         Error
              │                     │
              ▼                     ▼
          Validate                Error State
              │                     │
       ┌──────┴──────┐              │
       │             │              │
    Invalid        Valid            │
       │             │              │
       ▼             ▼              │
     Ignore       Tracking ◄────────┘
                     │
                     ▼
              Latest Location
                     │
          ┌──────────┼──────────┐
          │          │          │
         Map      Geofence   Attendance
```

---

# 31. Edge Case Checklist

The implementation must consider:

### Permission

- [ ] Permission granted before tracking
- [ ] Permission denied
- [ ] Permission revoked while tracking

### GPS

- [ ] GPS enabled
- [ ] GPS disabled
- [ ] GPS unavailable
- [ ] GPS timeout
- [ ] Location provider error

### Data

- [ ] Valid coordinates
- [ ] Missing coordinates
- [ ] NaN coordinates
- [ ] Invalid accuracy
- [ ] Stale location
- [ ] Duplicate location updates

### Lifecycle

- [ ] Start tracking
- [ ] Stop tracking
- [ ] Component unmount
- [ ] App background
- [ ] App foreground
- [ ] Avoid duplicate watchers

### Device

- [ ] Physical device
- [ ] Android emulator
- [ ] iOS simulator

### Connectivity

- [ ] Internet available
- [ ] Internet unavailable

### Performance

- [ ] Single active watcher
- [ ] Proper watcher cleanup
- [ ] No infinite retry loop
- [ ] No unnecessary tracking

---

# 32. Testing Scenarios

## Scenario 1 — Normal

```text
Permission granted
GPS enabled
Location available

Expected:
Tracking starts
Location displayed
```

---

## Scenario 2 — GPS Disabled

```text
Permission granted
GPS disabled

Expected:
Tracking error
Show location unavailable state
```

---

## Scenario 3 — Permission Revoked

```text
Permission granted
Start tracking
Revoke permission
Return to app

Expected:
Tracking stops/fails safely
Permission is rechecked
Permission UI is displayed
```

---

## Scenario 4 — Timeout

```text
GPS enabled
No location returned within timeout

Expected:
Timeout error
Retry available
App does not crash
```

---

## Scenario 5 — Offline

```text
Internet disabled
GPS enabled
Permission granted

Expected:
GPS continues working
Location continues updating
```

---

## Scenario 6 — Start Twice

```text
startTracking()
startTracking()
```

Expected:

```text
Only one watcher
```

---

## Scenario 7 — Stop Twice

```text
stopTracking()
stopTracking()
```

Expected:

```text
No crash
No active watcher
```

---

## Scenario 8 — Unmount

```text
Home mounts
    ↓
Tracking starts
    ↓
Home unmounts
```

Expected:

```text
Watcher cleared
No location callbacks after cleanup
```

---

## Scenario 9 — Poor Accuracy

```text
Location received
accuracy = poor
```

Expected:

```text
Location is retained
Accuracy is exposed
Geofence layer decides whether it is acceptable
```

Do not discard all low-accuracy locations inside the GPS service unless we explicitly define that policy.

---

# 33. Definition of Done

GPS tracking is complete when:

- [ ] `react-native-geolocation-service` is installed
- [ ] Native configuration is complete
- [ ] Location service is isolated
- [ ] Custom hook exposes location state
- [ ] Permission dependency works
- [ ] Tracking starts correctly
- [ ] Location updates continuously
- [ ] Accuracy is available
- [ ] Timestamp is available
- [ ] Errors are normalized
- [ ] GPS-disabled state is handled
- [ ] Timeout is handled
- [ ] Retry is possible
- [ ] Duplicate watchers are prevented
- [ ] Watcher is cleared correctly
- [ ] App lifecycle is handled appropriately
- [ ] Offline GPS behavior is understood
- [ ] No map/geofence/attendance logic exists in this feature

---

# 34. Git Commit Plan

Keep the implementation small.

### Commit 1

Install and configure the library:

```bash
git add .
git commit -m "feat: add location tracking dependency"
```

### Commit 2

Create the native location utility:

```bash
git add .
git commit -m "feat: add location tracking utility"
```

### Commit 3

Create the React hook:

```bash
git add .
git commit -m "feat: add location tracking hook"
```

### Commit 4

Integrate location tracking into Home:

```bash
git add .
git commit -m "feat: integrate location tracking"
```

### Commit 5

Only if an actual bug is discovered:

```bash
git add .
git commit -m "fix: handle location tracking errors"
```

Do not create commits just for the sake of increasing the commit count. Each commit should represent one meaningful change.

---

# 35. Final Responsibility Boundary

After this task, the architecture should look like:

```text
┌─────────────────────────┐
│      Permission         │
│                         │
│ Is location allowed?    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│      GPS Tracking       │
│                         │
│ Where is the user?      │
└────────────┬────────────┘
             │
             ▼
       Current Location
             │
       ┌─────┼─────┐
       │     │     │
       ▼     ▼     ▼
      Map  Geofence  UI
             │
             ▼
        Inside/Outside
             │
             ▼
         Attendance
```

The key principle is:

> **GPS tracking provides location. It should not decide what that location means.**

The next feature will consume this clean location layer to implement the map and 100m office geofence.
