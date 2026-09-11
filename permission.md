# GeoAttend — Location Permission Flow

## 1. Objective

GeoAttend requires location permission because attendance can only be checked when the user is physically within the configured office geofence.

The permission flow should:

- Check location permission when the app starts.
- Show the main application when permission is granted.
- Show a custom permission screen when permission is not granted.
- Request native location permission when the user taps "Allow Location".
- Handle denied permission.
- Handle blocked permission.
- Allow the user to open application settings when permission is blocked.
- Re-check permission when the app returns from Settings.
- Keep permission logic outside the UI.

---

# 2. Architecture

The permission implementation should be divided into three layers:

```text
┌──────────────────────────────┐
│        AppNavigator          │
│                              │
│  Permission → MainTabs       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      usePermission.ts        │
│                              │
│  - permission state          │
│  - check permission          │
│  - request permission       │
│  - open settings             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       permission.ts          │
│                              │
│  - checkLocationPermission() │
│  - requestLocationPermission│
│  - openAppSettings()         │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   react-native-permissions   │
└──────────────────────────────┘
```

The UI should never directly import or call `react-native-permissions`.

---

# 3. Permission States

`react-native-permissions` provides these relevant statuses:

```text
GRANTED
DENIED
BLOCKED
UNAVAILABLE
```

The library defines:

- `GRANTED` — permission is available.
- `DENIED` — permission is denied but can still be requested.
- `BLOCKED` — permission is denied and cannot be requested normally.
- `UNAVAILABLE` — the permission/feature is unavailable on the device.

Reference: `react-native-permissions` permission flow and status definitions.

---

# 4. Application-Level Permission State

The hook should expose a simplified application state:

```ts
type PermissionState =
  | 'checking'
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable';
```

### Meaning

```text
checking
    ↓
Application is checking the native permission.

granted
    ↓
User can enter the main application.

denied
    ↓
Permission can still be requested.

blocked
    ↓
Permission cannot be requested normally.
User should be directed to Settings.

unavailable
    ↓
Location permission/feature is unavailable.
Show an appropriate error state.
```

---

# 5. Complete Application Flow

## App Launch

```text
                APP START
                    │
                    ▼
              Splash Screen
                    │
                    ▼
        usePermission initializes
                    │
                    ▼
       checkLocationPermission()
                    │
             ┌──────┴──────┐
             │             │
          GRANTED      NOT GRANTED
             │             │
             ▼             ▼
         MainTabs     PermissionScreen
```

---

# 6. Permission Already Granted

If the user has already granted location permission:

```text
App Launch
    ↓
Check Permission
    ↓
GRANTED
    ↓
MainTabs
    ↓
Home
```

The permission screen should NOT be displayed.

The user should go directly to the application.

---

# 7. Permission Not Requested / Requestable

If the permission status is `DENIED`:

```text
App Launch
    ↓
Check Permission
    ↓
DENIED
    ↓
PermissionScreen
```

The custom screen should explain why GeoAttend needs location.

Example:

```text
Location Permission Required

GeoAttend needs your location to
verify that you are at the office
before checking you in.

[ Allow Location ]
```

When the user taps the button:

```text
PermissionScreen
      ↓
requestLocationPermission()
      ↓
Native OS Permission Dialog
```

The native operating system handles the actual permission prompt.

---

# 8. User Grants Permission

```text
PermissionScreen
      ↓
User taps "Allow Location"
      ↓
Native Permission Dialog
      ↓
User allows permission
      ↓
RESULTS.GRANTED
      ↓
Permission state = granted
      ↓
MainTabs
      ↓
Home
```

The navigation should react to the permission state.

Do not make the permission screen manually control the root navigation with:

```ts
navigation.navigate('Home');
```

Instead:

```text
Permission State
      ↓
AppNavigator
      ↓
permission === granted
      ↓
MainTabs
```

This keeps navigation state-driven.

---

# 9. User Denies Permission

If the user denies the native permission request:

```text
PermissionScreen
      ↓
Request permission
      ↓
User selects "Don't Allow"
      ↓
RESULTS.DENIED / platform-specific result
      ↓
PermissionScreen remains visible
```

The screen should explain that location access is required for attendance.

Example:

```text
Location Permission Needed

Without location access, GeoAttend
cannot verify your office location.

[ Try Again ]
```

The user can press "Try Again" and trigger another permission request if the platform still allows it.

---

# 10. Permission Becomes Blocked

If the permission is no longer requestable:

```text
check/request
      ↓
RESULTS.BLOCKED
      ↓
PermissionScreen
      ↓
Show "Open Settings"
```

Example:

```text
Location Access Required

Location permission has been disabled
for GeoAttend.

Please enable Location permission
from your device Settings.

[ Open Settings ]
```

`react-native-permissions` provides `openSettings('application')` for opening the application's system settings.

---

# 11. Open Settings Flow

When the user presses:

```text
[ Open Settings ]
```

the flow is:

```text
PermissionScreen
      ↓
openAppSettings()
      ↓
System Settings
      ↓
User enables Location permission
      ↓
User returns to GeoAttend
      ↓
App becomes active
      ↓
Check permission again
      ↓
GRANTED
      ↓
MainTabs
```

The hook should listen for the application returning to the foreground.

---

# 12. AppState Handling

The Settings flow requires an application lifecycle check.

```text
GeoAttend
    ↓
Open Settings
    ↓
App goes to background/inactive
    ↓
User changes permission
    ↓
User returns to GeoAttend
    ↓
AppState = active
    ↓
checkLocationPermission()
```

This prevents the app from remaining stuck on the permission screen after the user has enabled permission from Settings.

---

# 13. Unavailable State

If the library returns:

```ts
RESULTS.UNAVAILABLE;
```

the app should not continuously request permission.

Instead show an appropriate unavailable/error state:

```text
Location Unavailable

Location services are not available
on this device.

Please check your device settings.
```

This state is separate from `BLOCKED`.

---

# 14. Navigation Structure

The application should have two root states:

```text
Root Navigator
│
├── PermissionScreen
│
└── MainTabs
      │
      ├── Home
      │
      └── History
```

### Permission not granted

```text
RootNavigator
    └── PermissionScreen
```

### Permission granted

```text
RootNavigator
    └── MainTabs
          ├── Home
          └── History
```

The bottom tabs should not be visible while the permission screen is displayed.

---

# 15. `permission.ts`

This file is responsible only for communicating with `react-native-permissions`.

Suggested functions:

```ts
checkLocationPermission();
requestLocationPermission();
openAppSettings();
```

Responsibilities:

```text
permission.ts
    │
    ├── knows which native permission to use
    ├── calls check()
    ├── calls request()
    └── calls openSettings()
```

It should NOT:

- render UI
- navigate
- contain React state
- show custom screens

---

# 16. `usePermission.ts`

The hook is responsible for React state and lifecycle.

Responsibilities:

```text
usePermission()
    │
    ├── permission state
    ├── initial permission check
    ├── request permission
    ├── open settings
    └── re-check when app becomes active
```

The hook should expose something conceptually similar to:

```ts
const { status, isChecking, requestPermission, openSettings, checkPermission } =
  usePermission();
```

The exact API can be finalized during implementation.

---

# 17. Permission Screen

`PermissionScreen.tsx` should only consume the hook.

Conceptually:

```text
PermissionScreen
      │
      ▼
usePermission()
      │
      ├── status
      ├── requestPermission()
      └── openSettings()
```

The screen should not contain:

```ts
check();
request();
openSettings();
```

from `react-native-permissions` directly.

---

# 18. Button Behavior

## Status: `denied`

Display:

```text
[ Allow Location ]
```

Action:

```text
requestPermission()
```

---

## Status: `blocked`

Display:

```text
[ Open Settings ]
```

Action:

```text
openSettings()
```

---

## Status: `unavailable`

Display an appropriate error message.

Do not repeatedly call `requestPermission()`.

---

## Status: `checking`

Show the splash/loading state.

Do not display the permission screen while the initial permission check is running.

---

# 19. Important Platform Consideration

`react-native-permissions` documents that Android's `check()` does not return `BLOCKED`; an Android request may be needed to determine that the permission is no longer requestable.

Therefore, the implementation should not assume that:

```ts
check() === BLOCKED;
```

will behave identically on iOS and Android.

The utility/hook should normalize the platform behavior into our application-level states.

---

# 20. Permission Flow Diagram

```text
                         APP START
                            │
                            ▼
                     Splash / Loading
                            │
                            ▼
                  Check Location Permission
                            │
              ┌─────────────┼─────────────┐
              │             │             │
           GRANTED        DENIED       UNAVAILABLE
              │             │             │
              ▼             ▼             ▼
          MainTabs     Permission UI   Error UI
              │             │
              │             ▼
              │       Request Permission
              │             │
              │      ┌──────┴───────┐
              │      │              │
              │   GRANTED        DENIED/
              │      │           BLOCKED
              │      │              │
              │      ▼              ▼
              │   MainTabs     Permission UI
              │                     │
              │                     ▼
              │               Open Settings
              │                     │
              │                     ▼
              │              User changes setting
              │                     │
              │                     ▼
              │                Returns to App
              │                     │
              │                     ▼
              │                Check Again
              │                     │
              └─────────────────────┘
```

---

# 21. Implementation Order

Implement this feature in small commits.

### Step 1 — Dependency

```bash
npm install react-native-permissions
```

Configure native permissions.

Commit:

```bash
git commit -m "feat: add location permission dependency"
```

### Step 2 — Permission Utility

Create:

```text
src/utils/permission.ts
```

Implement:

```text
checkLocationPermission()
requestLocationPermission()
openAppSettings()
```

Commit:

```bash
git commit -m "feat: add location permission utilities"
```

### Step 3 — Permission Hook

Create:

```text
src/hooks/usePermission.ts
```

Implement:

```text
permission state
initial check
request
settings
AppState handling
```

Commit:

```bash
git commit -m "feat: add location permission hook"
```

### Step 4 — Permission Screen

Implement:

```text
src/screens/PermissionScreen.tsx
```

Handle:

```text
checking
denied
blocked
unavailable
```

Commit:

```bash
git commit -m "feat: add location permission screen"
```

### Step 5 — Navigation Integration

Update the root navigator:

```text
permission granted → MainTabs
otherwise → PermissionScreen
```

Commit:

```bash
git commit -m "feat: protect app with location permission"
```

### Step 6 — Test and Fix

Test:

```text
Fresh installation
Already granted
Allow
Deny
Blocked
Open Settings
Enable permission
Return to app
App resume
```

Any actual bug should receive a separate `fix:` commit.

Example:

```bash
git commit -m "fix: refresh permission on app resume"
```

---

# 22. What This Feature Does NOT Handle Yet

Do not mix these into the permission feature:

- GPS enabled/disabled
- GPS accuracy
- Current coordinates
- Location tracking
- Geofence calculation
- Attendance check-in
- Offline attendance
- Attendance storage

Those belong to later tasks.

The final flow will eventually become:

```text
Permission
    ↓
GPS Availability
    ↓
Location Tracking
    ↓
Geofence
    ↓
Attendance
    ↓
Local Storage
    ↓
History
```

This separation keeps each feature independently understandable and gives us a clean Git history.
