---
name: migrate-from-revenuecat
description: Use this skill when the user wants to move an app that uses the RevenueCat SDK onto a RevenueDot server without anyone losing access. It covers the import, a side-by-side run with store notifications forwarded to RevenueCat, the one-line proxy URL change per SDK, verification and the final cutover.
license: MIT
---

# Migrate from RevenueCat to RevenueDot

RevenueDot speaks the same API as RevenueCat, so the app keeps the RevenueCat SDK it ships today. The migration runs both systems side by side until the new app version has replaced the old one, then turns RevenueCat off.

RevenueDot is not affiliated with RevenueCat, Inc.

## Rules for the agent

- **Never read, ask for, print or pass a secret key.** That covers the RevenueDot secret key, the RevenueCat secret key and the store keys. Do RevenueDot steps with the RevenueDot MCP tools, which sign in with OAuth.
- **The importer runs in the developer's own terminal.** `npx revenuedot@0.2.0 import` needs a RevenueCat and a RevenueDot secret key, so the developer runs those commands and types the keys there. Show the commands; do not run them yourself, and do not ask for the keys or the shell's variables. The developer can paste the report back: it contains no keys.
- **Store credentials are entered by the developer in the dashboard.** Never ask for the .p8 file or the service account JSON in the chat.
- **If the user pastes a key into the chat anyway,** do not repeat, store or use it. Tell them the key is now exposed: revoke it (an App Store key in App Store Connect > Users and Access > Integrations, a Google service account key in the Google Cloud console, a RevenueDot or RevenueCat secret key on that dashboard's API keys page), create a new one, and enter it in the RevenueDot dashboard.
- **Follow the phases in order.** Each phase ends with a check. Do not start the next phase until the check passes.
- **Do not create webhooks in RevenueDot before phase 7.** RevenueCat still sends the user's webhooks, and both systems would fire for the same purchase.
- Ask the user for anything below that you cannot find. Do not guess ids or URLs.

## What you need

1. **The RevenueDot connector connected** to the target project. In Claude, that is the RevenueDot connector or this plugin's MCP server, `https://mcp.revenuedot.app/claude/mcp`; other clients use `https://mcp.revenuedot.app/mcp`. Connecting opens a RevenueDot sign-in (OAuth) where the user picks the project and **read and change** access. Check it with `list-projects`.
2. A running RevenueDot server, served at the root of its host (the SDKs drop any path). For RevenueDot Cloud it is `https://api.revenuedot.app` (sign up at https://app.revenuedot.app). To run your own server, use the `self-host` skill first.
3. The RevenueCat project id (starts with `proj`, in the RevenueCat dashboard URL). It is not a secret; the user can tell you.
4. For the importer, two keys that stay on the developer's machine:
   - A RevenueDot secret key for the target project, created in the RevenueDot dashboard under **API keys**.
   - A RevenueCat secret API key, **version V2**, with read access to project configuration and customer information (RevenueCat: Project settings > API keys > New secret API key). It starts with `sk_` (or `atk_` for an OAuth token); a public SDK key is rejected.
5. For each App Store app, the In-App Purchase key (.p8 file, key ID, issuer ID). For each Google Play app, the service account JSON with the "View financial data" permission. RevenueCat cannot export these. The developer enters them in the dashboard in phase 3.
6. Node.js 18.17 or newer on the developer's machine.

## Phase 1: Get the importer

1. Run `npx revenuedot@0.2.0 --help`. It needs no key.
2. If `npx` cannot reach npm (an offline or locked-down machine), run it from source instead:
   ```bash
   git clone https://github.com/revenuedot/revenuedot.git && cd revenuedot && pnpm install
   alias revenuedot='pnpm --filter revenuedot cli'
   ```
   In the steps below, replace `npx revenuedot@0.2.0` with `revenuedot`, run from inside the clone. pnpm runs the command in `packages/importer`, so the state file lands there, and file flags such as `--google-tokens` need absolute paths.

**Check:** the help text starts with `revenuedot: move a project from RevenueCat to RevenueDot.`

## Phase 2: Import the project

Ask the developer to open a terminal of their own. The importer asks for the two secret keys itself when it starts, and hides what they type or paste, so no key goes on the command line, into a shell variable or into the chat. First the project id and the server, which are not secret:

```bash
export REVENUECAT_PROJECT_ID=proj...
export REVENUEDOT_URL=https://api.revenuedot.app
```

For a self-hosted server, `REVENUEDOT_URL` is its own address. The importer reads all four variables, so the flags `--rc-key`, `--rc-project`, `--to` and `--to-key` can be left out.

1. The developer runs a dry run. It reads everything and writes nothing:
   ```bash
   npx revenuedot@0.2.0 import --from-revenuecat --dry-run
   ```
2. Go through the report with the user. It lists the apps, products, entitlements, offerings and packages that would be created, and the customer count.
3. The developer runs the import:
   ```bash
   npx revenuedot@0.2.0 import --from-revenuecat
   ```
   - It makes about 5 requests per customer. RevenueCat allows 480 requests a minute, so expect about 90 customers a minute. On a 429 answer it waits and carries on.
   - If it stops, run the same command again. It resumes from the state file `./revenuedot-import-<project>.json`. Use `--restart` to ignore the file, and `--state <file>` to choose another file.
   - For a trial, add `--limit 50` to import only the first 50 customers.
   - By default the import keeps each app's RevenueCat public SDK key, so shipped app builds keep working. `--no-public-keys` keeps RevenueDot's own keys instead; then the app update in phase 6 must use the keys `list-public-api-keys` returns.
   - The import sends no webhooks. `--emit-events` turns that on; do not use it during a side-by-side run.
   - If the user has Google Play purchase tokens in a CSV, add `--google-tokens tokens.csv`. The CSV needs a `purchase_token` column plus either `order_id`, or `app_user_id` and `product_id`.
   - Add `--json` for a machine-readable report. Use `--to-project <id>` only when the key can see several projects.

**Check:** the report says `Import finished`, and its Customers line ends with `complete`. Then call `get-import-status`: it returns `customers`, `subscriptions` and `needs_token_refresh`. `list-apps`, `list-products`, `list-entitlements` and `list-offerings` show the imported catalog.

## Phase 3: Add store credentials, then import again

1. The report's section "Store credentials to re-enter in RevenueDot" lists every app that needs them. `get-project-health` shows the same: each app with `credentials_configured: false` needs them. (`npx revenuedot@0.2.0 import plan --rc-project $REVENUECAT_PROJECT_ID`, run by the developer, prints the list with app ids.)
2. The developer adds them in the RevenueDot dashboard: **Apps**, the app, **In-app purchase key** (App Store: the .p8 file, key ID and issuer ID) or **Service account credentials** (Google Play: the JSON file).
3. The developer runs the import again (same command as phase 2). With credentials in place, RevenueDot asks Apple for each subscription's `original_transaction_id` and looks up Google purchase tokens by order id.

**Check:** `verify-store-credentials` with each store app's `app_id` returns `"status":"valid"`. `get-import-status` shows `needs_token_refresh` at or near 0. Any left over get their token from the next renewal notification or from `syncPurchases()` in phase 6.

## Phase 4: Route store notifications through RevenueDot (side-by-side run)

1. Turn on **Track new purchases from server-to-server notifications** for each store app, so renewals of subscribers RevenueDot has not seen yet are recorded instead of ignored: `update-app` with the `app_id` and `track_new_purchases: true`.
2. **App Store.** Ask the user for the App Store notification URL RevenueCat gave them (RevenueCat app settings). Call `update-app` with `notification_forward_url` set to it, then `get-app-store-settings` for the URL to give Apple. Its `notification_url` has the form `<server>/v1/notifications/apple/<app_id>`. The user pastes it into App Store Connect > App Information > App Store Server Notifications, for both **Production** and **Sandbox**. RevenueDot stores each notification, applies it, and copies the exact body to RevenueCat.
3. **Google Play.** `get-app-store-settings` returns the notification URL, of the form `<server>/v1/notifications/google/<app_id>`.
   - If the Pub/Sub topic set in Play Console > Monetization setup is in the user's own Google Cloud project, the user adds a second **push** subscription to that topic pointing at this URL. RevenueCat's own subscription keeps receiving every message; no forwarding is needed.
   - Otherwise, call `update-app` for the Play app with `notification_forward_url` set to RevenueCat's Google notification URL, and the user points the topic's push subscription at RevenueDot.

If the connection has no `update-app` or `get-app-store-settings` tool (some assistants offer fewer tools), the user does the same on the app's page in the dashboard: **Forward notifications to RevenueCat or your own server**, **Track new purchases from server-to-server notifications**, and the notification URL to copy.

**Check:** `get-app-store-settings` for each app shows `track_new_purchases: true` and the expected `notification_forward_url`. After the store sends its first notification (a renewal, or a test notification requested from Apple), `notification_status` turns `received` or `ready`, and `last_forward.status` shows the forwarding result. `waiting` means nothing has arrived yet. `get-project-health` shows the same for every app at once. `failing` means a notification was rejected; read `last_notification_error`.

## Phase 5: Verify the import

The developer runs, in the same terminal as phase 2:

```bash
npx revenuedot@0.2.0 import verify
```

It compares, for every customer, the active entitlements, their expiry dates and the number of subscriptions that give access. It exits with code 1 when it finds a difference. Purchases made since the last import show up as differences: run the import again, then verify again. Add `--limit <n>` to check only the first n customers. To look at one customer it names, call `get-customer`.

**Check:** `No differences: N customers match.` Differences that stay after a fresh import point to data the import could not bring over; show them to the user.

## Phase 6: Ship the app update

Set the proxy URL **before** `configure`, and turn off response-signature checks where the SDK has them (RevenueDot does not sign with RevenueCat's key). Keep the existing public SDK keys in the app unless phase 2 used `--no-public-keys`. Call `syncPurchases()` once on the first launch after the update, so current subscribers' store purchases reach RevenueDot.

| SDK | Proxy URL line | Signature checks |
|---|---|---|
| iOS, macOS, tvOS, watchOS, visionOS (RevenueCat iOS 5.x) | `Purchases.proxyURL = URL(string: "https://revenuedot.example.com")!` | `Configuration.Builder(withAPIKey: "appl_...").with(entitlementVerificationMode: .disabled).build()` |
| Android (Kotlin) | `Purchases.proxyURL = URL("https://revenuedot.example.com")` | `.entitlementVerificationMode(EntitlementVerificationMode.DISABLED)` on `PurchasesConfiguration.Builder` |
| React Native, Expo (`react-native-purchases`) | `await Purchases.setProxyURL("https://revenuedot.example.com");` | Disabled is the default. Remove any `ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL` |
| Flutter (`purchases_flutter`, iOS and Android) | `await Purchases.setProxyURL('https://revenuedot.example.com');` | Disabled is the default. Flutter web cannot use a proxy URL yet |
| Capacitor, Ionic | `await Purchases.setProxyURL({ url: "https://revenuedot.example.com" });` | `entitlementVerificationMode: ENTITLEMENT_VERIFICATION_MODE.DISABLED` in `configure` |
| Cordova | `Purchases.setProxyURL("https://revenuedot.example.com");` | No option. The SDK logs a verification error and still grants access |
| Kotlin Multiplatform | `Purchases.proxyURL = "https://revenuedot.example.com"` (a String) | `verificationMode = EntitlementVerificationMode.DISABLED` (the default) |
| Unity | Inspector field **Proxy URL** on the Purchases component. There is no `SetProxyURL` method | Inspector **Entitlement Verification Mode**: Disabled |
| Web (`@revenuecat/purchases-js`) | `httpConfig: { proxyURL: "https://revenuedot.example.com" }` in `Purchases.configure` (no trailing slash) | Also set `flags: { collectAnalyticsEvents: false }`. Only Test Store (`test_`) keys work against RevenueDot today |

`syncPurchases()` per SDK: iOS `_ = try? await Purchases.shared.syncPurchases()`, Android `Purchases.sharedInstance.syncPurchases()`, React Native `await Purchases.syncPurchasesForResult();`, Flutter `await Purchases.syncPurchases();`.

Full before and after files for every SDK: https://github.com/revenuedot/examples/tree/main/migrate-from-revenuecat/diffs

Tell the user: with a proxy URL, the Android SDK still sends diagnostics, paywall events and ad events to RevenueCat's hosts. Purchases, customer info and offerings go to RevenueDot.

**Check:** build the app and run it against the RevenueDot server. `get-project-health` lists the SDK builds that called it under `sdk_versions`. `get-customer` for a known subscriber still shows their entitlement active.

## Phase 7: Keep RevenueDot current, then cut over

1. While older app versions still call RevenueCat, the developer re-runs the import daily (it is idempotent) and then `npx revenuedot@0.2.0 import verify`, in their own terminal as in phase 2.
2. `npx revenuedot@0.2.0 import plan --rc-project $REVENUECAT_PROJECT_ID`, run by the developer, prints the remaining steps with the project's real app ids and URLs.
3. When verify shows no differences and almost all active users run the new version:
   - Remove each forwarding URL: `update-app` with the `app_id` and `notification_forward_url: ""`.
   - Create the webhooks in RevenueDot with `create-webhook-integration` (a `name` and the `url`). The response carries the signing secret once: tell the user to store it in their backend's secret settings right away.
   - The user turns off the webhooks in RevenueCat, then RevenueCat itself.

**Check:** `get-project-health` shows every store app `ready` and `webhooks.failing` empty, and `get-app-store-settings` shows `notification_forward_url: null` for each app.

## Exit codes and help

`revenuedot import` exits 0 on success, 1 on failure (or differences, for `verify`) and 2 on wrong usage. `npx revenuedot@0.2.0 import --help` lists every flag.
