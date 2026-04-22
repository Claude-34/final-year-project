# Pothole Detection (Expo Router) — Final Year Project Scaffold

Built with **Expo SDK 54** (React Native 0.81, React 19.1).

This repository is a **feature-based** React Native + Expo app scaffold for:

- pothole image capture (camera + GPS tagging)
- computer vision detection (on-device or API — stubbed until backend/model is connected)
- prioritization scoring (weighted multi-criteria engine)
- reporting + map-oriented workflows (UI shells)

## Prerequisites

- Node.js + npm
- Expo Go (phone) or an emulator setup

## Run

```bash
npm install
npm run start
```

## Project structure (high level)

- `src/app/`: Expo Router routes only (`_layout.tsx`, screens)
- `src/components/`: reusable UI
- `src/features/`: domain logic (auth, capture, detection, prioritization, reports, maps)
- `src/services/`: integrations (API, storage, connectivity, notifications)
- `src/store/`: Zustand global state (auth/session/UI flags)
- `src/hooks/`: cross-cutting hooks
- `src/theme/`, `src/utils/`, `src/types/`, `src/config/`

## Configure backend (next)

Set your API base URL in:

- `src/config/app.config.ts` → `apiBaseUrl`

When `apiBaseUrl` is empty, the app runs in **stub mode**:

- auth uses demo tokens stored via `expo-secure-store`
- CV inference returns deterministic stub outputs in `src/features/detection/inference.service.ts`
- reports save locally via AsyncStorage in `src/features/reports/reports.service.ts`

## Map (react-native-maps)

- **iOS**: Uses Apple Maps in Expo Go / dev builds; no API key required for the default map.
- **Android**: Set your Google Maps SDK key in `app.json` → `expo.android.config.googleMaps.apiKey`. Without a valid key, the map may appear blank on Android. Create a key in [Google Cloud Console](https://console.cloud.google.com/) with **Maps SDK for Android** enabled.
- **Web**: The Map tab uses [`map.web.tsx`](src/app/(tabs)/map.web.tsx) — `react-native-maps` is not supported on web.

## Permissions

Configured in `app.json` plugins for:

- camera / image picker
- location
- secure storage

## MVP roadmap (implementation order)

1. **Backend**: auth + report CRUD + image upload (S3/Cloudinary/Firebase Storage)
2. **CV**: connect `endpoints.inference` to your model service (YOLO/etc.)
3. **Maps**: replace map stub UI with `react-native-maps` markers/clusters + filters
4. **Offline**: expand `offline-queue.ts` replay + conflict handling
5. **Prioritization**: replace stub risk/frequency signals with real GIS + historical crash data

## Notes

- This folder name contains spaces; local tooling is fine, but some CLIs are picky — prefer quoting paths in terminals.
