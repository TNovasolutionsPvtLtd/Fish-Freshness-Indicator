# Fish Freshness Mobile App (React Native + Expo)

Implements all screens from the project guide's Phase 5 (user + admin flows).

## Setup

```bash
cd mobile
npm install
```

Open `src/services/api.js` and set `API_BASE_URL` to your backend's address:
- iOS simulator: `http://localhost:5000` works.
- Android emulator: use `http://10.0.2.2:5000`.
- Physical device with Expo Go: use your computer's LAN IP, e.g. `http://192.168.1.20:5000`.

Then run:

```bash
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press
`a` / `i` to launch an emulator.

## Screens

**User flow:** Login → Signup → Dashboard ("Check Freshness" button + recent
history) → Photo Upload (camera or gallery) → Result (FRESH/MEDIUM/SPOILED
with confidence %).

**Admin flow** (log in via "Admin login" link on the Login screen, using the
default admin account created by the backend): Admin Dashboard (stats) →
Image Upload (add labelled training photos) → Database View (browse/filter/
approve/reject dataset images) → User Management (view users, flag accounts).

Which stack you land in is decided automatically in
`src/navigation/AppNavigator.js` based on the logged-in user's role.

## Building an APK

```bash
npx eas build -p android --profile preview
```
(Requires a free Expo/EAS account — see Expo's docs for `eas.json` setup.)
