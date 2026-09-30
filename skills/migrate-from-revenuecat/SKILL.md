---
name: migrate-from-revenuecat
description: Use this skill when the user wants to move an app that uses the RevenueCat SDK onto a RevenueDot server without anyone losing access. It covers the import, a side-by-side run with store notifications forwarded to RevenueCat, the one-line proxy URL change per SDK, verification and the final cutover.
license: MIT
---

# Migrate from RevenueCat to RevenueDot

RevenueDot speaks the same API as RevenueCat, so the app keeps the RevenueCat SDK it ships today. The migration runs both systems side by side until the new app version has replaced the old one, then turns RevenueCat off.

RevenueDot is not affiliated with RevenueCat, Inc.

## Rules for the agent

- **Never write secret keys into files that get committed.** Pass them as environment variables in the shell. Public SDK keys (`appl_`, `goog_`, `test_`) may go in app code.
- **Follow the phases in order.** Each phase ends with a check. Do not start the next phase until the check passes.
- **Do not create webhooks in RevenueDot before phase 7.** RevenueCat still sends the user's webhooks, and both systems would fire for the same purchase.
- Ask the user for anything below that you cannot find. Do not guess ids or URLs.

## What you need from the user

1. A running RevenueDot server URL, served at the root of its host (the SDKs drop any path). For RevenueDot Cloud it is `https://api.revenuedot.app` (sign up at https://app.revenuedot.app). To run your own server, use the `self-host` skill first.
2. A RevenueDot secret key (`sk_...`) for the target project: dashboard, **API keys** page.
3. A RevenueCat secret API key, **version V2**, with read access to project configuration and customer information (RevenueCat: Project settings > API keys > New secret API key). It must start with `sk_` (or `atk_` for an OAuth token); a public SDK key is rejected.
4. The RevenueCat project id (starts with `proj`, in the RevenueCat dashboard URL).
5. For each App Store app: the In-App Purchase key (.p8 file, key ID, issuer ID). For each Google Play app: the service account JSON with the "View financial data" permission. RevenueCat cannot export these.
6. Node.js 18.17 or newer.

Set these once per shell:

```bash
export REVENUECAT_API_KEY=sk_...        # RevenueCat v2 secret key
export REVENUECAT_PROJECT_ID=proj...    # RevenueCat project id
export REVENUEDOT_URL=https://revenuedot.example.com
export REVENUEDOT_API_KEY=sk_...        # RevenueDot secret key
```

The importer reads all four variables, so the flags `--rc-key`, `--rc-project`, `--to` and `--to-key` can be left out.

## Phase 1: Get the importer

1. Run `npx revenuedot --help`.
2. If `npx` cannot reach npm (an offline or locked-down machine), run it from source instead:
   ```bash
   git clone https://github.com/revenuedot/revenuedot.git && cd revenuedot && pnpm install
   alias revenuedot='pnpm --filter revenuedot cli'
   ```
   In the steps below, replace `npx revenuedot` with `revenuedot`, run from inside the clone. pnpm runs the command in `packages/importer`, so the state file lands there, and file flags such as `--google-tokens` need absolute paths.

**Check:** the help text starts with `revenuedot: move a project from RevenueCat to RevenueDot.`

## Phase 2: Import the project

1. Dry run. It reads everything and writes nothing:
   ```bash
   npx revenuedot import --from-revenuecat --dry-run
   ```
2. Show the user the report. It lists the apps, products, entitlements, offerings and packages that would be created, and the customer count.
3. Run the import:
   ```bash
   npx revenuedot import --from-revenuecat
   ```
   - It makes about 5 requests per customer. RevenueCat allows 480 requests a minute, so expect about 90 customers a minute. On a 429 answer it waits and carries on.
   - If it stops, run the same command again. It resumes from the state file `./revenuedot-import-<project>.json`. Use `--restart` to ignore the file, and `--state <file>` to choose another file.
   - For a trial, add `--limit 50` to import only the first 50 customers.
   - By default the import keeps each app's RevenueCat public SDK key, so shipped app builds keep working. `--no-public-keys` keeps RevenueDot's own keys instead; then the app update in phase 5 must use the keys RevenueDot shows.
   - The import sends no webhooks. `--emit-events` turns that on; do not use it during a side-by-side run.
   - If the user has Google Play purchase tokens in a CSV, add `--google-tokens tokens.csv`. The CSV needs a `purchase_token` column plus either `order_id`, or `app_user_id` and `product_id`.
   - Add `--json` for a machine-readable report. Use `--to-project <id>` only when the key can see several projects.

**Check:** the report says `Import finished` and `Customers (pass N, complete)`. Then:
```bash
curl -s -H "Authorization: Bearer $REVENUEDOT_API_KEY" "$REVENUEDOT_URL/v2/projects/<project_id>/import/status"
```
It returns `customers`, `subscriptions` and `needs_token_refresh`. `GET $REVENUEDOT_URL/v2/projects` with the same key returns the project id.

## Phase 3: Add store credentials, then import again

1. The report's section "Store credentials to re-enter in RevenueDot" lists every app that needs them. `npx revenuedot import plan --rc-project $REVENUECAT_PROJECT_ID` prints the same list with app ids.
2. The user adds them in the RevenueDot dashboard (Apps > the app). Through the API the fields are:
   - App Store: `POST /v2/projects/<project_id>/apps/<app_id>` with `{"app_store":{"subscription_private_key":"<.p8 contents>","subscription_key_id":"...","subscription_key_issuer":"..."}}`
   - Google Play: `{"play_store":{"play_service_account_credentials_json":"<JSON>"}}` on the same path.
   Ask the user to do this step themselves if they prefer not to share the key files.
3. Run the import again (same command as phase 2). With credentials in place, RevenueDot asks Apple for each subscription's `original_transaction_id` and looks up Google purchase tokens by order id.

**Check:** for each store app,
```bash
curl -s -X POST -H "Authorization: Bearer $REVENUEDOT_API_KEY" -H "content-type: application/json" \
  "$REVENUEDOT_URL/v2/projects/<project_id>/apps/<app_id>/actions/verify_credentials" -d '{}'
```
returns `"status":"valid"`. `import/status` shows `needs_token_refresh` at or near 0. Any left over get their token from the next renewal notification or from `syncPurchases()` in phase 5.

## Phase 4: Route store notifications through RevenueDot (side-by-side run)

1. Turn on **Track new purchases from server-to-server notifications** for each store app, so renewals of subscribers RevenueDot has not seen yet are recorded instead of ignored:
   ```bash
   curl -s -X POST -H "Authorization: Bearer $REVENUEDOT_API_KEY" -H "content-type: application/json" \
     "$REVENUEDOT_URL/v2/projects/<project_id>/apps/<app_id>" -d '{"app_store":{"track_new_purchases":true}}'
   ```
   Use `"play_store"` instead of `"app_store"` for a Google Play app.
2. **App Store.** Ask the user for the App Store notification URL RevenueCat gave them (RevenueCat app settings). Set it as the forwarding URL with the script from the examples repo:
   ```bash
   curl -fsSLO https://raw.githubusercontent.com/revenuedot/examples/main/migrate-from-revenuecat/forward-notifications.sh
   RD_URL=$REVENUEDOT_URL RD_KEY=$REVENUEDOT_API_KEY PROJECT=<project_id> APP=<app_id> \
   FORWARD_URL='<RevenueCat App Store notification URL>' bash forward-notifications.sh
   ```
   It needs `curl` and `jq`, and prints `notification_url`. The user pastes that URL into App Store Connect > App Information > App Store Server Notifications, for both **Production** and **Sandbox**. It has the form `$REVENUEDOT_URL/v1/notifications/apple/<app_id>`. RevenueDot stores each notification, applies it, and copies the exact body to RevenueCat.
3. **Google Play.** The notification URL is `$REVENUEDOT_URL/v1/notifications/google/<app_id>`.
   - If the Pub/Sub topic set in Play Console > Monetization setup is in the user's own Google Cloud project, add a second **push** subscription to that topic pointing at this URL. RevenueCat's own subscription keeps receiving every message; no forwarding is needed.
   - Otherwise, run `forward-notifications.sh` for the Play app with RevenueCat's Google notification URL, and point the topic's push subscription at RevenueDot.

**Check:** for each app,
```bash
curl -s -H "Authorization: Bearer $REVENUEDOT_API_KEY" "$REVENUEDOT_URL/v2/projects/<project_id>/apps/<app_id>/store_settings"
```
shows `track_new_purchases: true` and the expected `notification_forward_url`. After the store sends its first notification (a renewal, or a test notification requested from Apple), `notification_status` turns `received` or `ready`, and `last_forward.status` shows the forwarding result. `waiting` means nothing has arrived yet. `GET /v2/projects/<project_id>/setup_health` shows the same for every app at once. `failing` means a notification was rejected; read `last_notification_error`.

## Phase 5: Verify the import

```bash
npx revenuedot import verify
```

It compares, for every customer, the active entitlements, their expiry dates and the number of subscriptions that give access. It exits with code 1 when it finds a difference. Purchases made since the last import show up as differences: run the import again, then verify again. Add `--limit <n>` to check only the first n customers.

**Check:** `No differences: N customers match.` Differences that stay after a fresh import point to data the import could not bring over; show them to the user.

## Phase 6: Ship the app update

Set the proxy URL **before** `configure`, and turn off response-signature checks where the SDK has them (RevenueDot does not sign with RevenueCat's key). Keep the existing API keys unless phase 2 used `--no-public-keys`. Call `syncPurchases()` once on the first launch after the update, so current subscribers' store purchases reach RevenueDot.

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

**Check:** build the app and run it against the RevenueDot server. The server's `setup_health` response lists the SDK builds that called it under `sdk_versions`. A known subscriber still sees their entitlement active.

## Phase 7: Keep RevenueDot current, then cut over

1. While older app versions still call RevenueCat, re-run the import daily (it is idempotent) and then `npx revenuedot import verify`.
2. `npx revenuedot import plan --rc-project $REVENUECAT_PROJECT_ID` prints the remaining steps with the project's real app ids and URLs.
3. When verify shows no differences and almost all active users run the new version:
   - Remove each forwarding URL: `POST /v2/projects/<project_id>/apps/<app_id>` with `{"app_store":{"notification_forward_url":null}}` (or `FORWARD_URL= bash forward-notifications.sh`).
   - Create the webhooks in RevenueDot: `POST /v2/projects/<project_id>/integrations/webhooks` with `{"name":"...","url":"https://..."}`. The response carries the signing secret once. With the RevenueDot MCP server, use `create-webhook-integration`.
   - Turn off the webhooks in RevenueCat, then RevenueCat itself.

**Check:** `setup_health` shows every store app `ready`, `webhooks.failing` is empty, and `store_settings` shows `notification_forward_url: null`.

## Optional: the RevenueDot MCP server

With the MCP server connected, `list-apps`, `list-products`, `list-entitlements`, `list-offerings`, `get-customer` and `get-import-status` answer the checks above without curl. Claude Code:

```bash
claude mcp add revenuedot -e REVENUEDOT_API_KEY=sk_... -e REVENUEDOT_URL=https://revenuedot.example.com -- npx -y @revenuedot/mcp
```

## Exit codes and help

`revenuedot import` exits 0 on success, 1 on failure (or differences, for `verify`) and 2 on wrong usage. `npx revenuedot import --help` lists every flag.
