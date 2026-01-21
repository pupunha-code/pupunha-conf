# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
bun install

# Start development server
bun start          # Opens options for iOS/Android/web
bun run ios        # Start iOS simulator
bun run android    # Start Android emulator
bun run web        # Start web browser

# Code quality
bun run lint       # Run ESLint with auto-fix
bun run format     # Format code with Prettier
bun run typecheck  # TypeScript type checking
```

## Architecture

This is a conference app built with **Expo SDK 54**, **React 19**, and **Expo Router v6**. It follows patterns inspired by the React Conf App but with a multi-event architecture.

### Tech Stack

- **React 19** with React Compiler experimental feature
- **TypeScript** with strict mode
- **Expo Router v6** for file-based navigation
- **Zustand** for state management (persisted with AsyncStorage)
- **React Native Reanimated** for animations
- **date-fns** for date formatting (pt-BR locale)

### Navigation Structure

```
app/
├── _layout.tsx              # Root layout with theme provider
├── index.tsx                # Event selector screen
├── +not-found.tsx           # 404 screen
└── (event)/                 # Event-scoped navigation
    ├── _layout.tsx          # Bottom tabs layout
    ├── calendar/            # Calendar stack
    │   ├── _layout.tsx
    │   └── index.tsx        # Schedule with day tabs
    ├── bookmarked.tsx       # Saved sessions
    ├── speakers.tsx         # Speakers list
    ├── info.tsx             # Event info & settings
    └── session/
        └── [id].tsx         # Session detail (modal)
```

### State Management

Two main Zustand stores in `src/store/`:

- **`app.store.ts`** - Theme, haptics, notifications, user preferences
- **`event.store.ts`** - Events, active event/day, bookmarks, derived selectors

Key pattern: `getActiveEvent()`, `getActiveDay()`, `getSessionsForActiveDay()` are derived selectors computed from state.

### Theme System

Centralized design tokens in `src/lib/theme/`:

- `colors.ts` - Light/dark color tokens with semantic naming
- `spacing.ts` - 4px grid system, border radius, icon sizes
- `typography.ts` - Font sizes, weights, and pre-defined text styles

Use the `useTheme()` hook to access `colorScheme`, `isDark`, `hapticEnabled`.

### Component Patterns

- **UI components** (`src/components/ui/`) - Text, Button, Card
- **Layout components** (`src/components/layout/`) - Screen, Header
- **Feature components** (`src/features/sessions/`) - SessionCard

All components use StyleSheet (no inline styles) and theme tokens.

### Key Conventions

- Content is in **Portuguese (pt-BR)**, code is in English
- Haptic feedback on interactions via `expo-haptics`
- Animations use `react-native-reanimated` (FadeIn, FadeInDown, etc.)
- Path alias `@/*` maps to `src/*`
- Expo Router root is `./src/app`
