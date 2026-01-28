# 🎤 Pupunha Conf

![pupunhasdsds](https://github.com/user-attachments/assets/f54bf35e-49d3-420f-b8c1-130501ed0bb8)

A mobile app for conferences and meetups by Pupunha Code. Built with React Native and Expo.

**Highly** based by the **Codecon** and **React Conf** apps.

https://github.com/expo/react-conf-app

> 🇧🇷 **Leia em Português:** [README.pt-BR.md](./README.pt-BR.md)

---

## 📖 Table of Contents

- [Features](#-features)
- [Technologies](#-technologies)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [Running the App](#-running-the-app)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

- 📅 **Event Calendar** - Browse sessions organized by day
- 👥 **Speakers** - Profiles with GitHub avatars, biographies, and social links
- 📝 **Session Details** - Complete information about talks and workshops
- 🔖 **Bookmarks** - Save favorite sessions for quick access
- 📱 **Social Feed** - Share posts and images with the community
- 🌓 **Dark Mode** - Automatic light/dark theme support
- 📱 **Cross-Platform** - iOS, Android, and Web

---

## 🛠️ Technologies

- **Expo** ~54.0
- **React Native** 0.81.5
- **React** 19.1.0
- **TypeScript**
- **Zustand** (state management)
- **Expo Router** (file-based routing)
- **Supabase** (backend & authentication)
- **React Query** (data fetching)

---

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

### Required

- **[Bun](https://bun.sh)** (v1.0 or higher) - Package manager and runtime
  - Install: `curl -fsSL https://bun.sh/install | bash`
  - Or use npm: `npm install -g bun`
- **[Node.js](https://nodejs.org/)** (v18 or higher) - Required for Expo
- **[Git](https://git-scm.com/)** - Version control

### For Mobile Development

**iOS (macOS only):**

- [Xcode](https://developer.apple.com/xcode/) (latest version)
- iOS Simulator (comes with Xcode)
- [CocoaPods](https://cocoapods.org/) - Install: `sudo gem install cocoapods`

**Android:**

- [Android Studio](https://developer.android.com/studio)
- Android SDK (installed via Android Studio)
- Android Emulator (set up via Android Studio)

**Web:**

- Any modern web browser (Chrome, Firefox, Safari, Edge)

### Optional

- [Expo Go](https://expo.dev/client) app on your phone for quick testing
- [EAS CLI](https://docs.expo.dev/build/introduction/) for building production apps

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/pupunha-code/pupunha-conf
cd pupunha-conf
```

### 2. Install Dependencies

```bash
bun install
```

> **Note:** If you don't have Bun installed, you can use npm instead:
>
> ```bash
> npm install
> ```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit `.env` and fill in your configuration values (see [Environment Setup](#-environment-setup) below).

### 4. Set Up Supabase Database

Run the SQL schema in your Supabase project (see [Database Setup](#-database-setup) below).

### 5. Start the Development Server

```bash
bun run start
```

This will start the Expo development server. You can then:

- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Press `w` to open in web browser
- Scan the QR code with Expo Go app on your phone

---

## 🔧 Environment Setup

The app requires several environment variables to function properly. Create a `.env` file in the root directory based on `.env.example`.

### Required Variables

#### Supabase Configuration

1. **Create a Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in
   - Create a new project
   - Wait for the project to finish setting up

2. **Get your Supabase credentials:**
   - Go to Project Settings → API
   - Copy your **Project URL** (this is your `EXPO_PUBLIC_SUPABASE_URL`)
   - Copy your **anon/public key** (this is your `EXPO_PUBLIC_SUPABASE_ANON_KEY`)

3. **Add to `.env`:**
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

#### Google OAuth Configuration

1. **Create a Google Cloud project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API

2. **Create OAuth 2.0 credentials:**
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Create credentials for:
     - **Web application** → Copy the Client ID
     - **iOS** → Copy the Client ID (requires bundle ID: `com.pupunhaconf.app`)
     - **Android** → Copy the Client ID (requires package name: `com.pupunhaconf.app`)

3. **Add to `.env`:**
   ```env
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
   ```

### Optional Variables

#### LogRocket (Analytics)

If you want to use LogRocket for error tracking and analytics:

1. Sign up at [logrocket.com](https://logrocket.com)
2. Create a new project
3. Copy your App ID
4. Add to `.env`:
   ```env
   EXPO_PUBLIC_LOGROCKET_APP_ID=your-logrocket-app-id
   ```

#### App Version

```env
EXPO_PUBLIC_APP_VERSION=1.0.0
```

---

## 🗄️ Database Setup

The app uses Supabase for data storage and authentication. You need to set up the database schema.

### Steps

1. **Open your Supabase project**
2. **Go to SQL Editor** (in the left sidebar)
3. **Copy and paste the contents of `supabase-schema.sql`**
4. **Click "Run"** to execute the SQL

This will create:

- `profiles` table - User profiles
- `feed_posts` table - Social feed posts
- Storage bucket for images
- Row Level Security (RLS) policies
- Triggers for automatic profile creation

### Verify Setup

After running the SQL, verify:

- Tables are created: Go to Table Editor → Check `profiles` and `feed_posts`
- Storage bucket exists: Go to Storage → Check `feed-images` bucket
- RLS is enabled: Check table settings

---

## 💻 Running the App

### Development Mode

Start the Expo development server:

```bash
bun run start
```

This opens the Expo DevTools. You can then:

- **iOS Simulator** (macOS only):

  ```bash
  bun run ios
  ```

  Or press `i` in the Expo DevTools

- **Android Emulator**:

  ```bash
  bun run android
  ```

  Or press `a` in the Expo DevTools

- **Web Browser**:

  ```bash
  bun run web
  ```

  Or press `w` in the Expo DevTools

- **Physical Device**:
  - Install [Expo Go](https://expo.dev/client) on your phone
  - Scan the QR code shown in the terminal/Expo DevTools
  - Make sure your phone and computer are on the same Wi-Fi network

### Production Build

For production builds, use [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

---

## 📁 Project Structure

```
src/
├── app/                    # Routes (Expo Router file-based routing)
│   ├── (dashboard)/       # Main app screens
│   │   └── (event)/       # Event-specific screens
│   │       ├── calendar/  # Calendar/schedule view
│   │       ├── bookmarked.tsx
│   │       ├── feed.tsx
│   │       ├── info.tsx
│   │       └── speakers.tsx
│   ├── (modal)/           # Modal screens
│   │   ├── session/[id].tsx
│   │   └── speaker/[id].tsx
│   ├── auth.tsx           # Authentication callback
│   └── index.tsx          # Event selector
├── components/            # Reusable UI components
│   ├── feed/             # Feed-related components
│   ├── layout/           # Layout components
│   └── ui/               # UI primitives
├── features/             # Feature-specific modules
│   └── sessions/         # Session-related code
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and theme
│   ├── supabase.ts       # Supabase client
│   └── theme/           # Design tokens
├── services/             # API and service layers
├── store/                # Zustand state stores
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
```

---

## 📜 Available Scripts

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `bun run start`     | Start Expo development server     |
| `bun run ios`       | Run on iOS simulator (macOS only) |
| `bun run android`   | Run on Android emulator           |
| `bun run web`       | Run in web browser                |
| `bun run lint`      | Run ESLint and fix issues         |
| `bun run format`    | Format code with Prettier         |
| `bun run typecheck` | Check TypeScript types            |

---

## 🔍 Troubleshooting

#### Environment variables not loading

- Make sure `.env` file exists in the root directory
- Restart the Expo development server after changing `.env`
- Variables must start with `EXPO_PUBLIC_` to be accessible

#### Supabase connection errors

- Verify your Supabase URL and anon key are correct
- Check that your Supabase project is active
- Ensure RLS policies are set up correctly

#### Google OAuth not working

- Verify all three client IDs are set (web, iOS, Android)
- Check that redirect URIs are configured in Google Cloud Console
- For iOS: Ensure bundle ID matches (`com.pupunhaconf.app`)
- For Android: Ensure package name matches (`com.pupunhaconf.app`)

### Getting Help

- Check [Expo Documentation](https://docs.expo.dev/)
- Check [Supabase Documentation](https://supabase.com/docs)
- Open an issue on [GitHub](https://github.com/pupunha-code/pupunha-conf/issues)

---

Made with ❤️ for the Pupunha Code community
