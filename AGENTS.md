# Needly Mobile

Expo (SDK 54) + React Native (0.81) + TypeScript mobile app using Expo Router, NativeWind v4, and Bun.

## Expo docs

Expo APIs changed a lot across SDKs. Read the **versioned** docs for this SDK (v54) before writing code: https://docs.expo.dev/versions/v54.0.0/. Do not trust unversioned guides or SDK 53 examples.

## Commands

- Package manager is **Bun** (`bun.lock`). Use `bun`/`bunx`, never `npm`/`npx`.
- `bun start` — dev server; `bun run android` / `bun run ios` / `bun run web` — start on a platform.
- `bun run lint` — ESLint (`expo lint`, config in `eslint.config.js`).
- Typecheck: `bunx tsc --noEmit` (no npm script). Run lint **then** typecheck before wrapping up.
- **There is no test framework installed.** README says `bun test`, but no Jest config/dependency exists — `bun test` fails. Do not run or add test commands unless you also add the framework and its config.

## Structure

- `src/app/` is the Expo Router tree (entrypoint is `expo-router/entry`, not `App.tsx`). Files = routes; `(tabs)/` group holds the tab screens; route groups are excluded from URLs.
- Imports use the `@/*` → `./src/*` alias (tsconfig). Always import via `@/`.
- `src/features/`, `src/services/`, `src/providers/`, etc. are mostly **empty scaffolding** (only `.gitkeep`). The README's thorough architecture/feature docs are aspirational, not implemented — verify files exist before referencing them. Real code currently lives in `src/components/`, `src/hooks/`, `src/constants/theme.ts`, `src/app/`, `src/services/api-client.ts`, `src/services/auth-api.ts`, `src/services/auth-token-store.ts`, `src/features/auth/`, `src/providers/`.
- README.md is the canonical architecture doc (Expo Router, thin route files calling feature components, feature isolation).

## Config & runtime quirks

- `app.json` enables `newArchEnabled`, `reactCompiler`, and `typedRoutes`. Generated route types live in `.expo/types/` (present; regenerate by starting Expo). Route `href`s are type-checked.
- React Compiler is on — follow its rules (no mutating state during render, etc.).
- NativeWind v4 + Tailwind v3 is **the only styling system** — always style with `className` (NativeWind), never RN `StyleSheet`/inline style objects. Wiring is in `babel.config.js` and `metro.config.js`; `global.css` is imported in `src/app/_layout.tsx`. Keep those three in sync when changing styling.
- `expo-env.d.ts` and native folders (`/ios`, `/android`) are gitignored/generated.
- No `.env` usage in code yet; env vars described in README are aspirational and not wired up.
- `scripts/reset-project.js` resets the repo to a blank template — do not run it on real work.

## Backend API (Needly REST handoff)

The full contract is in the `needly-mobile` API handoff / `docs/openapi.json` (see README). Key rules that must be preserved in every implementation:

- **Base URLs**: dev `http://localhost:8080/api/v1`, prod `https://api.needly.com/api/v1`. The client reads `EXPO_PUBLIC_API_URL` (`process.env.EXPO_PUBLIC_API_URL`, inlined by Expo) and falls back to the dev URL. Env vars are NOT wired to `.env` yet.
- **Auth**: Bearer JWT (HS256). Access token lives **in memory only** (`src/services/auth-token-store.ts`, wired via `src/services/auth-api.ts`); the refresh token lives in **secure storage** (`expo-secure-store`) on native and in memory on web (never `localStorage`). Access token valid 3600s (`expires_in`), refresh token ~30 days.
- **Refresh rules**: single-flight (`refreshPromise`), never parallel; proactive refresh ≤60s before expiry; on a single `401` → refresh → retry the request once; on refresh failure/revocation → clear tokens and bounce to login. On register/login, store the whole token pair.
- **Error format**: every API error is `{ "error": "…" }`. The client normalizes to `ApiError` (`status`, `message`, `retryAfter` from the `Retry-After` header on `429`). Surface `ApiError.message` to the user.
- **Rate limits**: 100 requests/min fallback, **10/min on auth routes** — throttle and show `retryAfter`; never hammer `refresh`.
- **Idempotency-Key**: required header (max 255 chars) on `POST/PUT/PATCH/DELETE` under households/categories/lists/items. Not needed for auth. Set via fetch header; generate a UUID if not provided.
- **No pagination** — list endpoints return full arrays.
- **Endpoints implemented so far** (all in `src/services/auth-api.ts`): `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` (optional body `{refresh_token}`), `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/reset-password` (body `{token, new_password}`), `GET /auth/verify-email?token=`, `POST /auth/resend-verification`. Returned shapes: `AuthResponse = { user_id, access_token, token_type, expires_in, refresh_token, user }`, `User = { id, name, email, is_email_verified, created_at }`.
- **Frontend flow** (matches the real API): signup → `register` stores tokens + redirects to the verify screen ("check your email") because registration does NOT auto-sign-in; login requires a verified email — unverified logins are routed to `/(auth)/verify`; forgot-password sends an email, the reset link carries the `token` in the URL and opens `/(auth)/reset-password` with that param. The OTP/code-entry screen stays but is disambiguated by `mode` (`signup` | `forgot`); `mode=signup` relies on the emailed 6-digit code from `resend-verification`, `mode=forgot` is a pass-through "check your email" state.
- **Not yet implemented** (later): households, categories, lists, items, history, notifications, Sync (`GET /households/:id/sync`), and the WebSocket (`ws://host/api/v1/ws/:household_id`, is an upgrade — browser cannot set `Authorization` headers on WS).
- **New route wiring**: `(auth)/verify` (params `mode`, `email`) — `mode=signup` verifies the entered code via `verifyEmail` (code = `token`), `mode=forgot` is a pass-through; and a future `verify-email` deep link route that reads `token` from the URL query and calls `GET /auth/verify-email`. `(auth)/reset-password` reads `token` from its URL param. Route files stay thin; screens live in `src/features/auth/components/`.

## Styling rules (NativeWind)

- Use `className` on every component (`View`, `Text`, `Pressable`, `ScrollView`, etc). No `StyleSheet.create`. Legacy `StyleSheet` in template files is frozen — do not copy that pattern.
- Colors, radius, and spacing come from the token mirror in `tailwind.config.js`/`src/constants/theme.ts` (e.g. `bg-primary-container`, `text-on-surface`, `border-outline-variant`, `rounded-md`, `gap-xl`, `min-h-huge`). Use arbitrary values (`w-[56px]`) only when a token doesn't exist. Keep both files in sync when adding tokens.
- For stateful styles (pressed/focused/error/selected), keep a `useState` flag and switch with template-literal class strings — NativeWind only picks up **full, literal class names** present in source, so never build class names dynamically (e.g. no `bg-${color}`).
- Light/dark theming is **component-driven**: every color token has a `-dark` twin in `tailwind.config.js`, and theme-aware components pick the pair for the active theme with `cls(lightClass, darkClass)` from `useTheme()`. Do **not** rely on `dark:` variants, CSS-variable `.dark` overrides, or NativeWind's `colorScheme.set()` — on native (NativeWind 4.x) those only react to *system* appearance changes, not manual toggles, so manual dark mode never applies on device.
- The two sanctioned inline-style exceptions: `style={typographyFor(language)[...]}` for font/letter-spacing (swaps Inter/Tajawal per script, strips `letterSpacing` for Arabic), and `style={{ direction }}` on screen roots for RTL (set from `useLanguage().language`; there is no Tailwind `direction` utility). Color stays a class in both cases.
- Language/direction flips live (no app reload): `setLanguage` calls `i18n.changeLanguage`, `LanguageProvider` is reactive via `useTranslation`, and each screen root derives its Yoga `direction` from `useLanguage().language`.
- `ScrollView` padding uses `contentContainerClassName`.