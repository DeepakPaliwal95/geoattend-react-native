# GeoAttend 📍

**Enterprise-Grade Geolocation Tracking & Geofence-Based Attendance System**

GeoAttend is a robust React Native (CLI) mobile application built for **Android** that demonstrates real-time location tracking and geofence-based attendance. The application pairs high-accuracy GPS tracking with a fixed office geofence (**100-meter radius**), enforcing strict location accuracy, freshness, duplicate prevention, and offline-first persistence.

> 🤖 **Target Platform**: **Android** (Tested on Android 15 / API 35, backward-compatible with API 24+)  
> 🛰️ **Tracking Scope**: **Foreground Only** (High-accuracy continuous GPS while the app is active)  
> 🗺️ **Map Integration**: **Google Maps SDK for Android** (requires API key in `android/local.properties`)

---

## 📑 Table of Contents

1. [Features & Capabilities](#-features--capabilities)
2. [Platform & Foreground Scope](#-platform--foreground-scope)
3. [Tech Stack & Architecture](#-tech-stack--architecture)
4. [End-to-End Application Flow](#-end-to-end-application-flow)
5. [Project Directory Structure](#-project-directory-structure)
6. [Core Implementation Details](#-core-implementation-details)
   - [1. Geofence & Distance Calculation](#1-geofence--distance-calculation)
   - [2. High-Accuracy Location Tracking & Smoothing](#2-high-accuracy-location-tracking--smoothing)
   - [3. Foreground-Only Tracking Architecture](#3-foreground-only-tracking-architecture)
   - [4. Notification Bar GPS Handling & Auto-Recovery](#4-notification-bar-gps-handling--auto-recovery)
   - [5. Real-Time Offline Detection & Local Storage](#5-real-time-offline-detection--local-storage)
   - [6. Check-In Validation & Duplicate Prevention](#6-check-in-validation--duplicate-prevention)
   - [7. Runtime Permissions & Fallbacks](#7-runtime-permissions--fallbacks)
7. [Design System & Utility Layer](#-design-system--utility-layer)
8. [Screens & User Interface](#-screens--user-interface)
9. [Edge Cases & Error Handling](#-edge-cases--error-handling)
10. [Getting Started & Android Setup](#-getting-started--android-setup)
    - [Configuring Google Maps API Key (`local.properties`)](#3-configure-google-maps-api-key-in-androidlocalproperties)
11. [Automated Testing](#-automated-testing)

---

## 📱 Features & Capabilities

- **Real-Time Foreground GPS Tracking**: High-accuracy fused location tracking with continuous updates even while stationary.
- **Fixed Office Geofence (100m Radius)**: Single source of truth for geographical attendance boundary.
- **Interactive Google Map Visualization**: Renders user position, office coordinates, live proximity radius, and dynamically colored geofence circle.
- **Position Smoothing Filter**: Exponential smoothing ($\alpha = 0.25$) on the user interface to stabilize GPS jitter without distorting ground-truth coordinates.
- **Notification Bar Location Off Handling**: Instant detection of GPS toggles from the notification shade/quick settings, with automatic background recovery when re-enabled.
- **Network Connectivity & Offline Support**: Real-time connection monitoring with `@react-native-community/netinfo`. Core check-in functions seamlessly offline using local GPS and persistent storage.
- **Local Attendance Persistence**: Zustand store backed by `@react-native-async-storage/async-storage` ensures historical records survive app restarts and kills.
- **Attendance History Log**: Chronological list of past check-ins displaying exact check-in timestamps, dates, and distances from the office.
- **Strict Check-In Validation**:
  - Distance check ($\le 100$ meters).
  - GPS accuracy filter ($\le 30$ meters).
  - GPS fix freshness check ($\le 10$ seconds old).
  - Duplicate check-in prevention (one check-in per calendar day).
- **Graceful Permissions Workflow**: Handles first-time permission requests, "Don't ask again" permanently blocked states, and provides direct deep-links to app settings.

---

## 🤖 Platform & Foreground Scope

### Android-Focused Implementation
GeoAttend is engineered specifically for the **Android platform** utilizing Google Play Services:
- Native integration with Android's **`FusedLocationProviderClient`** via `react-native-geolocation-service` for fast GPS locking and battery-efficient location queries.
- Native Google Maps renderer via `react-native-maps` using Google Play Services Maps SDK.
- Fine-grained permission workflows for Android runtime permissions (`ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION`).

### Foreground-Only Location Scope
Location tracking is strictly confined to the **active foreground**:
- **Continuous Updates While Active**: While `HomeScreen` is mounted, the application continuously streams location updates so the user can see their live position relative to the office geofence.
- **Automatic Teardown on Background / Unmount**: As soon as the user navigates away or backgrounds the app, the location watcher is immediately terminated to conserve battery and honor user privacy.
- **Why No Background Tracking?**: Because this is an attendance application, continuous background tracking is not needed. Adding background tracking would introduce substantial architectural complexity (requiring persistent foreground services, ongoing notification tray icons, and invasive `ACCESS_BACKGROUND_LOCATION` permissions) while causing heavy battery consumption. Employees intentionally open the app to mark their attendance upon arriving at work, making foreground-only tracking the most efficient, user-respectful, and battery-friendly design.

---

## 🛠 Tech Stack & Architecture

| Layer | Technology | Rationale |
|---|---|---|
| **Core Framework** | React Native 0.84 (CLI) | Native Android performance and complete control over Gradle & native modules |
| **Language** | TypeScript | Strong typing, interfaces, and compile-time verification |
| **State Management** | Zustand (`zustand/middleware`) | Lightweight, hook-friendly, minimal boilerplate with built-in AsyncStorage persistence |
| **Navigation** | `@react-navigation/native` + Bottom Tabs | Clean tab-based navigation between Home and History |
| **Maps** | `react-native-maps` | Native Google Maps integration with circles, markers, and live centering |
| **Geolocation** | `react-native-geolocation-service` | Direct access to Android `FusedLocationProviderClient` |
| **Permissions** | `react-native-permissions` | Cross-platform runtime permission abstraction |
| **Network** | `@react-native-community/netinfo` | Real-time network reachability detection |
| **Persistence** | `@react-native-async-storage/async-storage` | On-device key-value store for attendance records |
| **Testing** | Jest + React Native Testing Library | Unit and component integration testing |

---

## 🧭 End-to-End Application Flow

```text
                           ┌────────────────────────┐
                           │       App Launch       │
                           └───────────┬────────────┘
                                       │
                                       ▼
                           ┌────────────────────────┐
                           │      SplashScreen      │
                           └───────────┬────────────┘
                                       │
                                       ▼
                       ┌────────────────────────────────┐
                       │  Check Location Permissions    │
                       └───────────────┬────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │                                             │
      [Blocked / Denied]                                  [Granted]
                │                                             │
                ▼                                             ▼
    ┌───────────────────────┐                     ┌───────────────────────┐
    │   PermissionScreen    │                     │     TabNavigator      │
    │  (Prompt / Open App   │                     │      HomeScreen       │
    │       Settings)       │                     └───────────┬───────────┘
    └───────────────────────┘                                 │
                                                              ▼
                                                 ┌─────────────────────────┐
                                                 │ Check Location Services │
                                                 │  & Start GPS Tracking   │
                                                 └────────────┬────────────┘
                                                              │
                     ┌────────────────────────────────────────┴────────────────────────────────────────┐
                     │                                                                                 │
            [Location OFF in Bar]                                                             [Location ON]
                     │                                                                                 │
                     ▼                                                                                 ▼
         ┌────────────────────────┐                                                       ┌────────────────────────┐
         │ Status: 'error'        │                                                       │ Receive GPS Fix        │
         │ Distance: '-- m'       │                                                       │ Smooth Coordinates     │
         │ Action: 'Enable GPS'   │                                                       │ Calculate Distance     │
         │ Auto-Recovery Active   │                                                       └───────────┬────────────┘
         └────────────────────────┘                                                                   │
                                                                                                      ▼
                                                                                   ┌─────────────────────────────────────┐
                                                                                   │ Geofence Check (Threshold: 100m)    │
                                                                                   └──────────────────┬──────────────────┘
                                                                                                      │
                                                   ┌──────────────────────────────────────────────────┴──────────────────────┐
                                                   │                                                                         │
                                           [Distance > 100m]                                                         [Distance <= 100m]
                                                   │                                                                         │
                                                   ▼                                                                         ▼
                                       ┌───────────────────────┐                                                 ┌───────────────────────┐
                                       │ Status: Outside       │                                                 │ Status: Inside        │
                                       │ Check-In Disabled     │                                                 │ Check-In Enabled      │
                                       └───────────────────────┘                                                 └───────────┬───────────┘
                                                                                                                             │
                                                                                                                  [User Taps Check In]
                                                                                                                             │
                                                                                                                             ▼
                                                                                                                 ┌───────────────────────┐
                                                                                                                 │ Validate:             │
                                                                                                                 │ • Accuracy <= 30m     │
                                                                                                                 │ • Age <= 10s          │
                                                                                                                 │ • Not checked in today│
                                                                                                                 └───────────┬───────────┘
                                                                                                                             │
                                                                                                                             ▼
                                                                                                                 ┌───────────────────────┐
                                                                                                                 │ Save Attendance       │
                                                                                                                 │ (Zustand+AsyncStorage)│
                                                                                                                 │ Button -> Checked In  │
                                                                                                                 └───────────────────────┘
```

---

## 🗂 Project Directory Structure

```text
GeoAttend/
├── android/                         # Android native project & Gradle config
│   ├── app/
│   │   ├── build.gradle             # Reads MAPS_API_KEY from local.properties
│   │   └── src/main/AndroidManifest.xml
│   └── local.properties             # (Developer-created) SDK path & MAPS_API_KEY
├── docs/                            # Architectural specifications & requirements
│   └── GeoAttend_README.md          # Reference spec
├── src/
│   ├── assets/                      # App icons and vector assets
│   ├── components/                  # Reusable UI components
│   │   ├── headers/                 # Screen headers (MainHeader, etc.)
│   │   ├── hoc/                     # Higher-order components (SafeArea, etc.)
│   │   └── map/                     # Map visualization components
│   │       └── AttendanceMap.tsx    # Google Map with markers, geofence circle & live tracking
│   ├── constants/
│   │   └── location.ts              # Office coordinates, geofence radius & GPS thresholds
│   ├── hooks/                       # Custom reusable React hooks
│   │   ├── useLocation.ts           # Core GPS watcher, error states & auto-recovery
│   │   ├── useNetwork.ts            # Network connectivity and offline monitor
│   │   ├── usePermission.ts         # Location permission checker and requester
│   │   ├── useStableLocation.ts     # Exponential location smoothing for map/UI
│   │   └── index.ts                 # Hook exports
│   ├── navigations/                 # Navigation setup
│   │   ├── Application.tsx          # Root Stack (Splash -> Permission -> Tabs)
│   │   └── TabNavigator.tsx         # Bottom Tabs (Home & Attendance History)
│   ├── screens/
│   │   ├── permission/
│   │   │   └── PermissionScreen.tsx # Fallback screen for denied/blocked location permissions
│   │   ├── splash/
│   │   │   └── SplashScreen.tsx     # Animated launch splash screen
│   │   └── tab/
│   │       ├── HomeScreen.tsx       # Main dashboard: Map, geofence status, offline alert & check-in
│   │       └── AttendanceHistory.tsx# Historical check-in records list
│   ├── store/                       # State management
│   │   └── attendanceStore.ts       # Zustand attendance store with AsyncStorage persistence
│   ├── types/                       # TypeScript models
│   │   ├── attendance.ts            # AttendanceRecord & AttendanceStatus types
│   │   └── navigation.type.ts       # Navigation stack & tab parameter types
│   └── utils/                       # Shared utility helpers (Rule-enforced single source of truth)
│       ├── fontIcons.utils.ts       # Centralized Ionicons mappings and font scale
│       ├── geofence.utils.ts        # Haversine distance and geofence evaluation
│       ├── helper.utils.ts          # Date/time formatting and string formatters
│       ├── location.utils.ts        # Geolocation service wrappers, validation & accuracy checks
│       ├── navigation.utils.ts      # Navigation container ref and imperative routing
│       ├── permission.utils.ts      # Android runtime permission checks and settings links
│       ├── responsive.utils.ts      # Screen width/height percentage scaling (wp, hp)
│       └── theme.utils.ts           # Color tokens, dark/light styles, badges & borders
└── __tests__/                       # Jest unit and integration test suites
```

---

## 🔬 Core Implementation Details

### 1. Geofence & Distance Calculation

The office location and geofence radius are defined in [src/constants/location.ts](file:///Users/deepakpaliwal/Desktop/GeoAttend/src/constants/location.ts):

```typescript
export const OFFICE_LOCATION = {
  latitude: 25.053778,
  longitude: 73.889511,
};

export const GEOFENCE_RADIUS = 100; // 100 meters
```

The geographical distance between the user's current coordinates and the office is calculated using the **Haversine Formula** in [src/utils/geofence.utils.ts](file:///Users/deepakpaliwal/Desktop/GeoAttend/src/utils/geofence.utils.ts):

$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$

- **Inside Office**: Calculated distance $\le 100\text{ m} \implies$ Check-in permitted.
- **Outside Office**: Calculated distance $> 100\text{ m} \implies$ Check-in disabled.

---

### 2. High-Accuracy Location Tracking & Smoothing

Foreground location tracking is configured in [src/utils/location.utils.ts](file:///Users/deepakpaliwal/Desktop/GeoAttend/src/utils/location.utils.ts) using `react-native-geolocation-service`:

```typescript
export const DEFAULT_WATCH_OPTIONS = {
  enableHighAccuracy: true,
  distanceFilter: 0,            // Updates continue even when stationary
  interval: 3000,              // Desired update interval: 3 seconds
  fastestInterval: 1500,       // Fastest interval: 1.5 seconds
  showLocationDialog: true,    // Prompts native location dialog if GPS is off
  useSignificantChanges: false,
};
```

#### Exponential Location Smoothing
To eliminate GPS jitter and map marker vibration while the user is stationary, [src/hooks/useStableLocation.ts](file:///Users/deepakpaliwal/Desktop/GeoAttend/src/hooks/useStableLocation.ts) applies exponential smoothing for display coordinates:

$$\text{pos}_{\text{smooth}} = \alpha \cdot \text{pos}_{\text{new}} + (1 - \alpha) \cdot \text{pos}_{\text{prev}} \quad (\alpha = 0.25)$$

> **Important**: The smoothed coordinate is used exclusively for fluid UI and map rendering. Official check-in validation always evaluates the raw, unadulterated GPS fix.

---

### 3. Foreground-Only Tracking Architecture

Location tracking is strictly confined to the **foreground**:
- Continuous tracking starts when `HomeScreen` mounts.
- When the screen unmounts, the watcher is stopped: `stopLocationTracking(watchId)`.
- When the app is backgrounded, tracking is paused; upon returning to `active` state, `useLocation` automatically verifies permissions and resumes tracking.
- **Complexity & Battery Rationale**: Because this is an attendance app, background tracking is intentionally omitted. Background tracking would introduce unwanted complexity and severe battery drain. Attendance is an intentional, foreground user action, not a passive background surveillance task.

---

### 4. Notification Bar GPS Handling & Auto-Recovery

When a user pulls down the notification shade or Android Quick Settings and turns off **Location**:
1. Android's `FusedLocationProvider` fires error code 2: `PositionError.POSITION_UNAVAILABLE`.
2. In [src/hooks/useLocation.ts](file:///Users/deepakpaliwal/Desktop/GeoAttend/src/hooks/useLocation.ts), the native watcher is immediately terminated, `watchIdRef.current` is cleared, and `status` transitions to `'error'`.
3. The UI updates instantaneously:
   - Distance changes to `-- m` (no stale distance shown).
   - Badge changes to **GPS Off**.
   - Alert banner instructs the user to enable Location.
   - Primary action button converts to **Enable GPS / Retry**.
4. **Auto-Recovery**:
   - **AppState Listener**: Returning to the app triggers an automatic `retry()`.
   - **Background Polling**: An active lightweight probe queries `getCurrentLocation` every 3 seconds while in error state. As soon as Location is re-enabled, tracking resumes automatically without requiring user taps.

---

### 5. Real-Time Offline Detection & Local Storage

- **Hook ([src/hooks/useNetwork.ts](file:///Users/deepakpaliwal/Desktop/GeoAttend/src/hooks/useNetwork.ts))**: Listens to `@react-native-community/netinfo`. Exposes `isOffline`.
- **Offline Banner**: In [src/screens/tab/HomeScreen.tsx](file:///Users/deepakpaliwal/Desktop/GeoAttend/src/screens/tab/HomeScreen.tsx), an amber notification banner displays:
  > ☁️ **You are offline • Attendance will be saved locally**
- **Offline Resilience**: Because GPS hardware operates independently of cellular/Wi-Fi data, employees can mark attendance even in basements or offline zones. Attendance records are stored locally via `AsyncStorage` and are ready to sync when an internet connection returns.

---

### 6. Check-In Validation & Duplicate Prevention

When the user taps **Check In**, the application executes a comprehensive 5-step validation gate before persisting the record:

```typescript
// 1. Availability Check
if (!location) throw new Error('Acquiring location...');

// 2. Freshness Check (within 10 seconds)
if (!isFreshLocation(location, MAX_LOCATION_AGE_MS)) {
  throw new Error('Location data is stale. Please wait for fresh GPS fix.');
}

// 3. Accuracy Threshold Check (within 30 meters)
if (!isAcceptableAccuracy(location, MAX_ACCURACY_THRESHOLD_METERS)) {
  throw new Error(`GPS accuracy too low (±${Math.round(location.coords.accuracy)}m). Move to an open area.`);
}

// 4. Geofence Check (within 100 meters)
if (distance > GEOFENCE_RADIUS) {
  throw new Error(`You are outside the office area (${Math.round(distance)}m). Move closer.`);
}

// 5. Duplicate Check
if (hasCheckedInToday()) {
  throw new Error('You have already checked in today.');
}
```

Records are stored in [src/store/attendanceStore.ts](file:///Users/deepakpaliwal/Desktop/GeoAttend/src/store/attendanceStore.ts) using the schema:

```typescript
export interface AttendanceRecord {
  id: string;               // Unique timestamp-based ID
  date: string;             // YYYY-MM-DD format
  checkInTime: string;      // e.g. "09:42 AM"
  latitude: number;
  longitude: number;
  distanceFromOffice: number; // In meters
  status: 'checked_in';
}
```

---

### 7. Runtime Permissions & Fallbacks

Handled in [src/utils/permission.utils.ts](file:///Users/deepakpaliwal/Desktop/GeoAttend/src/utils/permission.utils.ts) and [src/hooks/usePermission.ts](file:///Users/deepakpaliwal/Desktop/GeoAttend/src/hooks/usePermission.ts):
- **Android**: Checks and requests `ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION`.
- **Permanently Blocked / Denied**: If a user selects "Don't ask again", the app displays [PermissionScreen.tsx](file:///Users/deepakpaliwal/Desktop/GeoAttend/src/screens/permission/PermissionScreen.tsx) with clear instructions and an **Open Settings** button that deep-links directly into device application settings via `openSettings()`.

---

## 🎨 Design System & Utility Layer

Per strict architecture guidelines, the application prohibits hardcoded styling values, inline colors, and duplicated logic. All design tokens are centralized in `src/utils/`:

- **Responsive Scaling ([src/utils/responsive.utils.ts](file:///Users/deepakpaliwal/Desktop/GeoAttend/src/utils/responsive.utils.ts))**: `wp(percentage)` and `hp(percentage)` for universal scaling across all Android device screen sizes and densities.
- **Theme Palette ([src/utils/theme.utils.ts](file:///Users/deepakpaliwal/Desktop/GeoAttend/src/utils/theme.utils.ts))**:
  - Primary Brand: `#2563EB`
  - Green Family (Inside Geofence): `green` (`#10B981`), `greenS1` (`#ECFDF5`), `greenBorder` (`#A7F3D0`), `greenDark` (`#065F46`)
  - Red Family (Outside Geofence / Error): `red` (`#EF4444`), `redS1` (`#FEE2E2`), `redBorder` (`#FECACA`), `redDark` (`#991B1B`)
  - Blue Family (Locating Status): `blue` (`#2563EB`), `blueS1` (`#EFF6FF`), `blueBorder` (`#BFDBFE`), `blueDark` (`#1E40AF`)
  - Amber Family (Warning / GPS Off): `amber` (`#F59E0B`), `amberS1` (`#FEF3C7`), `amberBorder` (`#FDE68A`), `amberDark` (`#92400E`)
  - Slate Family (Dark Neutral / Offline Banner): `slateDark` (`#1E293B`), `slateBorder` (`#334155`), `slateMuted` (`#475569`)
- **Typography & Icons ([src/utils/fontIcons.utils.ts](file:///Users/deepakpaliwal/Desktop/GeoAttend/src/utils/fontIcons.utils.ts))**: Consistent icon names (`cloudOffline`, `location`, `checkmarkCircle`, etc.) and font size tokens (`f10` through `f36`).

---

## 📲 Screens & User Interface

### 1. Home / Attendance Screen (`HomeScreen.tsx`)
- **Google Map View (`AttendanceMap.tsx`)**:
  - Live animated map with automatic centering on initial GPS fix.
  - Blue dot with accuracy ring for the user.
  - Red office marker.
  - Geofence circle: Green fill when inside ($\le 100\text{m}$), Red fill when outside ($> 100\text{m}$).
- **Status Cards**:
  - Real-time distance readout (e.g. `42 m` or `-- m`).
  - Geofence badge (`Inside Office`, `Outside Office`, `GPS Off`).
  - Office address & GPS accuracy display.
- **Dynamic Action Button**:
  - Outside geofence: Disabled `Check In` button.
  - Inside geofence: Active green `Check In` button with haptic feedback.
  - Already checked in: Disabled `✓ Checked In` button with timestamp.
  - GPS disabled: Amber `Enable GPS / Retry` button.

### 2. Attendance History Screen (`AttendanceHistory.tsx`)
- Chronological list of historical attendance records.
- Date group headers (e.g. `Today, 12 Sep 2026`).
- Individual record cards showing exact check-in time (`09:42 AM`) and verified distance from office (`42 m`).
- Friendly empty-state illustration when no check-ins have been recorded.

### 3. Permission Fallback Screen (`PermissionScreen.tsx`)
- Displayed when location permissions are denied or blocked.
- Explains why location services are essential for attendance verification.
- Direct "Open Settings" action button.

---

## 🎯 Edge Cases & Error Handling

| Edge Case | Root Cause | App Behavior |
|---|---|---|
| **Location toggled off in notification shade** | User disables GPS in quick settings | Catches `POSITION_UNAVAILABLE`, halts watcher, resets distance to `-- m`, displays "GPS Off" badge and "Enable GPS / Retry" button; auto-recovers when turned back on. |
| **User outside 100m geofence** | Employee is not at the office | Check-in button disabled; displays remaining distance and status "Outside Office". |
| **Poor GPS accuracy (> 30m)** | Tall buildings, indoor attenuation | Prevents false check-ins; alerts user that GPS accuracy is insufficient and requests moving closer to a window or outdoors. |
| **Stale GPS cache (> 10s)** | Android cached last-known position | Rejects check-in until fresh, real-time coordinates are streamed from hardware. |
| **Duplicate check-in** | Tapping check-in multiple times | Store validates `date === today`; disables button and displays "Already Checked In". |
| **No Internet Connection** | Airplane mode or no data | Offline banner is displayed; check-in continues locally via GPS and persists to AsyncStorage. |
| **Permission permanently blocked** | User chose "Don't ask again" | Redirects to dedicated `PermissionScreen` with "Open Settings" button. |
| **App killed & restarted** | OS process termination | Zustand rehydrates records from AsyncStorage; preserves "Checked In" status if done earlier today. |

---

## 🚀 Getting Started & Android Setup

### Prerequisites

- **Node.js**: $\ge 18$
- **Yarn** or **npm**
- **Android Studio** & **Android SDK** (API level 34 or 35)
- **Android Physical Device or Emulator** with Google Play Services
- **Watchman** (`brew install watchman` on macOS)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/DeepakPaliwal95/geoattend-react-native.git
   cd GeoAttend
   ```

2. **Install JavaScript dependencies**:
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Configure Google Maps API Key in `android/local.properties`**:
   The application uses Google Maps on Android via `react-native-maps`. To view the Google Map tiles properly, developer needs to create/configure `local.properties` and add the map key inside that file.

   Create a `local.properties` file inside the `android/` folder (`android/local.properties`):
   ```properties
   ## Android SDK location (adjust to your local system path)
   sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk

   ## Google Maps API Key for Android
   MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
   ```

   > 🔒 **Security Best Practice (Hidden Key)**:
   > The Google Maps API key is kept in `android/local.properties` rather than hardcoded in source files or `AndroidManifest.xml` **for security purposes**. The `local.properties` file is strictly ignored by `.gitignore` and is **never committed to version control**, preventing private API keys from being exposed on GitHub or public repositories.

   > 💡 **How it works**:
   > In [android/app/build.gradle](file:///Users/deepakpaliwal/Desktop/GeoAttend/android/app/build.gradle), Gradle reads `MAPS_API_KEY` from `local.properties` and injects it into [AndroidManifest.xml](file:///Users/deepakpaliwal/Desktop/GeoAttend/android/app/src/main/AndroidManifest.xml) via `manifestPlaceholders = [ MAPS_API_KEY: mapsApiKey ]`:
   > ```xml
   > <meta-data
   >   android:name="com.google.android.geo.API_KEY"
   >   android:value="${MAPS_API_KEY}" />
   > ```
   > If `MAPS_API_KEY` is not provided or invalid, the app will run, but the map view will display blank grid tiles. Ensure the key has the **Maps SDK for Android** enabled in Google Cloud Console.

---

### Running on Android

Ensure an Android emulator or physical device is connected via ADB (`adb devices`):

```bash
# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Build and run the Android app
npm run android
```

---

## 🧪 Automated Testing

GeoAttend includes a full test suite built with **Jest** and **React Native Testing Library**, covering all utility functions, stores, and custom hooks.

```bash
# Run all unit test suites
npm test
```

### Test Coverage Highlights

- **`useLocation.test.tsx`**: Validates location tracking lifecycle, status transitions, position availability errors, and watcher unmount cleanup.
- **`useNetwork.test.tsx`**: Tests real-time connectivity changes, reachability events, and offline flag computations.
- **`attendanceStore.test.ts`**: Verifies record creation, duplicate prevention for the same calendar date, persistence hydration, and history queries.
- **`geofence.utils.test.ts`**: Tests Haversine distance calculations, boundary condition assertions ($< 100\text{m}$, $= 100\text{m}$, $> 100\text{m}$), and coordinate edge cases.
- **`location.utils.test.ts`**: Verifies accuracy thresholds, timestamp age validity, and error transformations.
- **`helper.utils.test.ts`**: Tests distance formatting (`m` and `km`), date header logic, and time string formatters.
- **`permission.utils.test.ts`**: Tests runtime permission states, request handling, and settings links.

**Current Test Results:**
```text
Test Suites: 9 passed, 9 total
Tests:       86 passed, 86 total
Snapshots:   0 total
Time:        0.672 s
```
