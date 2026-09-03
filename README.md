# 📱 Needly Mobile

> **Never forget what you need.**

Needly Mobile is the React Native application for **Needly**, a shared shopping and household coordination platform.

Needly helps couples, families, and roommates manage shared shopping lists, coordinate household needs, and keep everyone synchronized across devices.

This repository contains the mobile client for the Needly platform.

---

## ✨ Features

### Core

- 🔐 User authentication
- 👥 Shared households
- 🛒 Shared shopping lists
- ➕ Quickly add shopping items
- ✏️ Edit shopping items
- ✅ Mark items as purchased
- 🗑️ Remove items
- 🏷️ Categories
- 🔢 Quantities and units
- 📝 Item notes
- 📱 Android and iOS support

### Planned

- ⚡ Real-time list synchronization
- 📜 Shopping history
- 🔄 Recurring items
- 📴 Offline-first support
- 🔁 Synchronization queue
- ⚔️ Conflict resolution
- 🔔 Push notifications

---

## 🏗️ Architecture

Needly Mobile is built using **React Native + Expo + TypeScript** and follows a **Feature-Based Architecture** with **Expo Router** for navigation.

The architecture is designed to keep routing, business logic, UI, and infrastructure clearly separated.

```text
                         Needly Mobile
                              │
                              ▼
                       ┌──────────────┐
                       │ Expo Router  │
                       └──────┬───────┘
                              │
                              ▼
                         src/app/
                              │
                     Routes & Layouts
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
         features/        components/       providers/
             │
      ┌──────┼──────┐
      │      │      │
      ▼      ▼      ▼
     auth  shopping household
      │
      ▼
   Services
      │
      ├── REST API
      ├── WebSocket
      └── Local Storage

src/features/
    → Feature-specific business logic and UI
src/services/

src/hooks/
    → Generic reusable hooks

src/utils/
    → Generic utility functions

src/constants/
    → Global constants

src/theme/
    → Design system and styling

src/types/
    → Shared TypeScript types
```

## 🧭 Expo Router

Needly uses Expo Router for file-based routing.

The filesystem defines the application's routes.

For example:

```text
src/app/
├── _layout.tsx
├── index.tsx
│
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
│
└── (app)/
    ├── _layout.tsx
    │
    ├── (tabs)/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── profile.tsx
    │   └── settings.tsx
    │
    └── products/
        ├── index.tsx
        └── [id].tsx
```

Each _layout.tsx defines the navigation behavior for its directory.

For example:

```tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
```

The filesystem handles route registration, so screens do not need to be manually registered in a navigation configuration.

## 📦 Route Groups

Expo Router route groups are used to organize routes without adding unnecessary path segments.

For example:

(auth)/login.tsx

maps to:

/login

rather than:

/auth/login

This allows the application to organize routes logically while keeping clean navigation paths.

Common groups in Needly are:

```text
(auth)
(app)
(tabs)
```

## 🔐 Authentication Architecture

Authentication is separated from the authenticated application.

```text
                         Root Layout
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
             (auth)                       (app)
                │                           │
        ┌───────┼───────┐             ┌────┴────┐
        │       │       │             │         │
      Login  Register  Forgot       Tabs     Products
                                      │
                              ┌───────┼───────┐
                              │       │       │
                            Home   Profile  Settings
```

The authentication feature is responsible for:

```text
Login
Registration
Logout
Session management
Authentication state
Authentication API calls
Authentication-related validation
```

Authentication state is exposed through the application's provider layer.

## 🧩 Feature-Based Architecture

Business functionality is organized by feature rather than by technical type.

For example:

src/features/

├── auth/
│ ├── api/
│ ├── components/
│ ├── hooks/
│ ├── store/
│ └── types/
│
├── shopping/
│ ├── api/
│ ├── components/
│ ├── hooks/
│ ├── store/
│ └── types/
│
├── household/
│ ├── api/
│ ├── components/
│ ├── hooks/
│ └── types/
│
├── history/
│ ├── api/
│ ├── components/
│ ├── hooks/
│ └── types/
│
├── profile/
│
└── settings/

Each feature should contain the logic that belongs specifically to that feature.

For example:

src/features/shopping/
├── api/
│ └── shoppingApi.ts
│
├── components/
│ ├── ShoppingList.tsx
│ ├── ShoppingItem.tsx
│ └── AddItemForm.tsx
│
├── hooks/
│ └── useShoppingList.ts
│
├── store/
│ └── shoppingStore.ts
│
└── types/
└── shopping.types.ts

This makes individual features easier to develop, test, maintain, and eventually refactor.

## 🗂️ Project Structure

.
├── src/
│ │
│ ├── app/
│ │ ├── _layout.tsx
│ │ ├── index.tsx
│ │ │
│ │ ├── (auth)/
│ │ │ ├── _layout.tsx
│ │ │ ├── login.tsx
│ │ │ ├── register.tsx
│ │ │ └── forgot-password.tsx
│ │ │
│ │ └── (app)/
│ │ ├── _layout.tsx
│ │ │
│ │ ├── (tabs)/
│ │ │ ├── _layout.tsx
│ │ │ ├── index.tsx
│ │ │ ├── profile.tsx
│ │ │ └── settings.tsx
│ │ │
│ │ └── products/
│ │ ├── index.tsx
│ │ └── [id].tsx
│ │
│ ├── features/
│ │ ├── auth/
│ │ ├── shopping/
│ │ ├── household/
│ │ ├── history/
│ │ ├── profile/
│ │ └── settings/
│ │
│ ├── components/
│ │ ├── ui/
│ │ └── feedback/
│ │
│ ├── providers/
│ │ ├── AppProviders.tsx
│ │ ├── AuthProvider.tsx
│ │ └── QueryProvider.tsx
│ │
│ ├── services/
│ │ ├── api/
│ │ ├── storage/
│ │ ├── websocket/
│ │ └── analytics/
│ │
│ ├── hooks/
│ ├── utils/
│ ├── constants/
│ ├── theme/
│ └── types/
│
├── assets/
│ ├── images/
│ ├── icons/
│ └── fonts/
│
├── scripts/
│
├── app.json
├── babel.config.js
├── metro.config.js
├── package.json
├── tsconfig.json
├── global.css
└── README.md

## 🎯 Separation of Responsibilities

One of the main goals of the architecture is to keep responsibilities clear.

src/app

Contains Expo Router routes and layouts.

Example:

```tsx
// src/app/(app)/products/[id].tsx

import { useLocalSearchParams } from "expo-router";
import { ProductDetailsScreen } from "@/features/products/components/ProductDetailsScreen";

export default function ProductDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ProductDetailsScreen productId={id} />;
}
```

The route should remain thin.

It should primarily connect the router to the appropriate feature.

src/features

Contains feature-specific application logic.

src/features/shopping/

may contain:

- Components
- API functions
- Hooks
- State
- Types
- Feature-specific utilities
  src/components

Contains UI components shared across multiple features.

Examples:

```text
src/components/ui/
├── Button.tsx
├── Input.tsx
├── Card.tsx
├── Modal.tsx
└── Avatar.tsx
```

A component should live here when it is genuinely reusable across different features.

src/services

Contains infrastructure and external integrations.

Examples:

```text
src/services/
├── api/
├── storage/
├── websocket/
└── analytics/
```

Feature-specific logic should remain inside the corresponding feature whenever possible.

src/providers

Contains global React providers.

Examples:

Authentication provider
TanStack Query provider
Theme provider
Application provider

The root layout can compose these providers:

```tsx
export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <Stack />
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
```

## 🛒 Core Shopping Experience

The shopping list is the central experience of Needly.

```text
┌──────────────────────────────┐
│ ← Groceries             ⋮    │
├──────────────────────────────┤
│                              │
│ PRODUCE                      │
│                              │
│ ☐ Milk                  2 L  │
│ ☐ Bananas                6   │
│ ☑ Apples                1kg │
│                              │
│ HOUSEHOLD                    │
│                              │
│ ☐ Toilet paper            1  │
│ ☐ Detergent               2  │
│                              │
│                         [+]  │
└──────────────────────────────┘
```

The primary interaction should be fast:

Tap +
↓
Type "Milk"
↓
Press Enter
↓
Milk appears in the list

Additional information can be added when needed:

Quantity
Unit
Category
Notes
Recurrence

## ⚡ Real-Time Synchronization

Needly is designed to support real-time collaboration between household members.

The intended architecture is:

```text
Phone A
   │
   │ User changes shopping list
   ▼
Needly Backend
   │
   │ WebSocket event
   ▼
Phone B
   │
   ▼
UI updates
```

The application should not require users to manually refresh the screen to see changes made by another household member.

Real-time functionality will be implemented through the shared WebSocket service:

src/services/websocket/

```text


while feature-specific WebSocket behavior remains inside the relevant feature.

For example:

src/features/shopping/
```

can react to shopping-related events.

## 📴 Offline-First Architecture

Offline support is an important part of the long-term Needly architecture.

The intended flow is:

```text
                  User Action
                       │
                       ▼
                Local Application
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
          Local DB            UI Update
             │
             ▼
      Synchronization Queue
             │
             │ Network available
             ▼
       Needly Backend
             │
             ▼
       Server Confirmation
```

This allows the application to remain responsive even when connectivity is unavailable.

The synchronization layer will eventually handle:

Local mutations
Pending operations
Retry logic
Server synchronization
Duplicate operations
Conflict resolution

```
## 🌐 Backend Communication

The mobile application communicates with the Needly backend through REST APIs and WebSockets.

┌───────────────────────┐
│     Needly Mobile     │
│                       │
│  React Native + Expo  │
└───────────┬───────────┘
            │
            ├──────── REST API ────────┐
            │                          │
            └────── WebSocket ────────┤
                                       ▼
                              ┌─────────────────┐
                              │ Needly Backend  │
                              └─────────────────┘
```

The application separates infrastructure from feature logic.

For example:

```text
src/services/api/


contains the shared API client and networking infrastructure.

Feature-specific API operations live under:

src/features/auth/api/
src/features/shopping/api/
src/features/household/api/
```

## 🛠️ Tech Stack

| Technology                   | Purpose                           |
| ---------------------------- | --------------------------------- |
| React Native                 | Mobile application framework      |
| Expo                         | Development and native tooling    |
| Expo Router                  | File-based routing and navigation |
| TypeScript                   | Type-safe application development |
| TanStack Query               | Server-state management           |
| Zustand                      | Client-side state management      |
| SQLite                       | Local persistence                 |
| WebSocket                    | Real-time communication           |
| NativeWind                   | Utility-first styling             |
| Jest                         | Unit testing                      |
| React Native Testing Library | Component testing                 |

Some technologies and capabilities are introduced progressively as the corresponding features are implemented.

## ⚙️ Environment Variables

Create a local environment configuration for development.

Example:

```env
API_URL=http://localhost:8080/api/v1
WS_URL=ws://localhost:8080/api/v1/ws
```

When running the application on a physical device, localhost refers to the device itself.

Use the local network IP address of the machine running the backend instead.

Example:

```env
API_URL=http://192.168.1.100:8080/api/v1
WS_URL=ws://192.168.1.100:8080/api/v1/ws
```

Never commit secrets, tokens, passwords, or private credentials to the repository.

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm or Yarn
- Expo development environment
- Android Studio for Android development
- Xcode for iOS development on macOS

### Clone the Repository

```bash
git clone https://github.com/AliFnieer/needly-mobile.git

cd needly-mobile

npm install

npm start
```

You can then open the application using:

- Expo Go
- Android Emulator
- iOS Simulator
- A physical Android device
- A physical iOS device

### Run Android

```bash
npm run android

npm run ios
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

The project aims to maintain reliable coverage around the most important application behavior.

Testing priorities include:

- Authentication
- Shopping list operations
- Feature logic
- State management
- API behavior
- Synchronization
- Important UI interactions

## 🧹 Code Quality

Before opening a pull request, make sure the project passes:

```bash
npm run lint


and:

npm test


TypeScript should also compile without errors.

npx tsc --noEmit
```

## 📋 Development Roadmap

### v0.1 — MVP

- Project architecture
- Authentication screens
- Registration
- Login
- Logout
- Household creation
- Household membership
- Home screen
- Shopping list
- Add item
- Edit item
- Complete item
- Delete item

### v0.2 — Collaboration

- Shared household synchronization
- Real-time updates
- Categories
- Quantity and units
- Item notes
- Improved shopping experience

### v0.3 — Smart Shopping

- Shopping history
- Re-add previous items
- Recurring items
- Offline mode
- Local persistence
- Synchronization queue
- Retry handling
- Conflict resolution

### v1.0 — Production

- Push notifications
- Android production release
- iOS production release
- Automated mobile CI/CD
- Performance optimization
- Error monitoring
- Production analytics
- App Store release
- Google Play release

## 🔗 Related Projects

Needly Mobile is part of the broader Needly platform.

Needly Backend

The Needly backend provides the services required by the mobile application, including:

- REST API
- Authentication
- Database persistence
- Household management
- Shopping list operations
- WebSocket infrastructure
- Synchronization services

Backend repository:

[https://github.com/AliFnieer/needly-backend](https://github.com/AliFnieer/needly-backend)


## 🤝 Development Principles

Needly is designed around a small set of core principles.

- **Simple User Experience**

Adding something to a shopping list should be fast and require minimal interaction.

- **Real-Time Collaboration**

Household members should have a consistent view of shared shopping information.

- **Offline Resilience**

The application should remain useful even when network connectivity is temporarily unavailable.

- **Feature Isolation**

Features should be independently maintainable and easy to extend.

- **Type Safety**

TypeScript is used throughout the application to improve developer experience and reduce runtime errors.

- **Clear Responsibilities**

Routing, UI, business logic, state, and infrastructure should have clear boundaries.

**Routing**
↓
src/app/

**Features**
↓
src/features/

**Shared UI**
↓
src/components/

**Infrastructure**
↓
src/services/

**Global State / Providers**
↓
src/providers/

## 📦 Project Status

Needly Mobile is currently under active development.

The architecture and core foundation are being established before implementing the complete shopping and collaboration experience.

The project is not yet considered production-ready.

## 📄 License

This project is licensed under the MIT License.

See the LICENSE file for details.
