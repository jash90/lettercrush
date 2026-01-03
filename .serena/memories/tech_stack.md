# Tech Stack

## Core
- **Framework:** React Native (via Expo SDK 54)
- **Language:** TypeScript (~5.3.0)
- **Router:** Expo Router (~6.0.21)
- **Web Support:** React Native Web

## Styling
- **CSS Framework:** Tailwind CSS (via `nativewind` likely, though `tailwind.config.js` is present, `package.json` doesn't explicitly list `nativewind` but it's standard for RN+Tailwind). *Correction*: `package.json` lists `expo-linear-gradient`, `@expo/vector-icons`.

## State Management
- **Library:** Zustand (^5.0.0)

## Data & Storage
- **Local Storage:** `@react-native-async-storage/async-storage`
- **Secure Storage:** `expo-secure-store`
- **Database:** `expo-sqlite` (likely for dictionary/user data)

## Testing
- **Runner:** Jest (^30.2.0)
- **Preset:** `jest-expo`
- **Mocks:** Custom mocks in `__mocks__`

## Build & Tooling
- **Bundler:** Metro
- **Compiler:** Babel
- **Type Checking:** TypeScript (`tsc`)
