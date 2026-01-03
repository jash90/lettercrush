# Code Style & Conventions

## General
- **Language:** TypeScript is enforced (`strict: true`).
- **Functional Components:** React Functional Components with Hooks.
- **File Naming:**
  - Components: PascalCase (e.g., `GameOverModal.tsx`)
  - Utilities/Hooks: camelCase (e.g., `useGame.ts`, `haptics.ts`)
  - Dictionary Data: `index.ts` in language folders.

## Directory Structure
- `app/`: Expo Router screens (file-based routing).
- `src/components/`: Reusable UI components.
- `src/engine/`: Core game logic (GridManager, WordValidator).
- `src/stores/`: Zustand state stores.
- `src/hooks/`: Custom React hooks.
- `src/data/`: Static data (dictionaries).
- `dictonary/`: Raw dictionary source files (large datasets).

## Specific Patterns
- **Dictionaries:**
  - Raw data in `dictonary/{lang}/index.ts`.
  - Adapters in `src/data/dictionaries/{lang}.ts`.
  - Avoid redundant arrays; derive types and flattened lists from structured objects.
- **State:** Zustand stores for global game state (`gameStore.ts`).
- **Testing:** Jest for unit tests, co-located `__tests__` directories.
- **Imports:** Absolute path aliases are configured (e.g., `@/components`, `@/engine`).

## V1.0 Specifics
- **Polish Language:** Simplified (no diacritics) for v1.0 grid compatibility.
