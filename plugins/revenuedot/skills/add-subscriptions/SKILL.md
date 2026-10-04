---
name: add-subscriptions
description: Use this skill when the user wants to add in-app subscriptions, a paywall, a premium plan, a free trial or a lifetime purchase to an iOS, Android, React Native, Flutter or Expo app, with RevenueDot as the subscription backend. It covers creating the catalog, installing and configuring the SDK, showing offerings, gating features on an entitlement, testing with the Test Store and connecting App Store and Google Play credentials, including when the user pastes a store key into the chat.
license: MIT
---

# Add subscriptions to an app with RevenueDot

RevenueDot is an open-source backend for in-app purchases that speaks RevenueCat's API. Apps use the RevenueCat SDK, pointed at a RevenueDot server with a proxy URL. The steps below set up one `pro` entitlement sold as monthly and yearly subscriptions, using the RevenueDot MCP tools.

RevenueDot is not affiliated with RevenueCat, Inc.

This skill creates the catalog through the connected RevenueDot account. To write the app code (SDK install, paywall screen, entitlement gate) without an account, use the `wire-subscription-sdk` skill.

## Rules for the agent

- **Do every RevenueDot step with the RevenueDot MCP tools.** They sign in with OAuth, so you never need a secret key. Do not ask the user for a secret key (`sk_...`), and do not call the REST API with one.
- **Store credentials are entered by the user in the dashboard.** Never ask the user to paste an App Store key or a Google service account into the chat.
- **If the user pastes a key into the chat anyway,** do not repeat any part of it (not even the key ID or issuer ID), store it or pass it to a tool, and do not tell them to upload that key. Tell them it is now exposed, in this order: revoke it (an App Store key in App Store Connect > Users and Access > Integrations, a Google service account key in the Google Cloud console, a RevenueDot or RevenueCat secret key on that dashboard's API keys page), create a new one, and enter only the new one in the RevenueDot dashboard (Apps, then the app, for store keys).
- Only the public SDK key (`test_`, `appl_`, `goog_`) goes into the app. It is public and ships inside the app.
- Ask the user for the product ids they created (or will create) in App Store Connect and Play Console. Store product ids must match exactly.
- Run the check at the end of each phase before moving on.

## What you need

1. **The RevenueDot connector connected.** In Claude, that is the RevenueDot connector or this plugin's MCP server, `https://mcp.revenuedot.app/claude/mcp`. Other clients use `https://mcp.revenuedot.app/mcp`. Connecting opens a RevenueDot sign-in (OAuth): the user picks the project and **read and change** access. There is nothing to paste.
2. A RevenueDot account. For RevenueDot Cloud, sign up at https://app.revenuedot.app (free plan); the SDK's proxy URL is `https://api.revenuedot.app`. To run your own server, use the `self-host` skill first.
3. The app's bundle id (iOS) and package name (Android).

Every tool takes an optional `project_id`. Leave it out: the connection has one project.

## Phase 1: Check the connection

Call `list-projects`. If the tools are missing, ask the user to connect the RevenueDot connector (Claude: Settings > Connectors, or `/mcp` in Claude Code) and sign in.

**Check:** `list-projects` returns the project.

## Phase 2: Create the apps

One app per store, with `create-app`:

1. `type: "test_store"`, `name: "Test Store"`. It lets you buy without any App Store or Google Play account. Its key only works in debug builds.
2. `type: "app_store"`, `name: "MyApp (iOS)"`, `bundle_id: "com.example.myapp"`.
3. `type: "play_store"`, `name: "MyApp (Android)"`, `package_name: "com.example.myapp"`.

If the connection has no `create-app` tool (some assistants offer fewer tools), ask the user to add the apps in the dashboard under **Apps**.

Real store purchases also need, per store app:
- **Credentials.** The user enters them in the dashboard (Apps > the app): the App Store In-App Purchase key (.p8 file, key ID, issuer ID), or a Google Play service account JSON with the "View financial data" permission. Then call `verify-store-credentials` with the `app_id`; it answers `"status":"valid"` when Apple or Google accept them.
- **Store notifications.** `get-app-store-settings` with the `app_id` returns `notification_url`. The user pastes it into App Store Connect > App Information > App Store Server Notifications (Production and Sandbox), or adds it as a **push** subscription to the Pub/Sub topic set in Play Console > Monetization setup.

**Check:** `list-apps` lists the apps. Note each app `id`.

## Phase 3: Create the catalog

Create each product once per app, with the same store identifier the store uses:

1. **Products:** `create-product` per app, with `app_id`, `store_identifier: "pro_monthly"`, `type: "subscription"`, `display_name: "Pro monthly"` and `subscription_duration: "P1M"`. Repeat for `pro_annual` with `"P1Y"`. `type` is one of `subscription`, `one_time`, `consumable`, `non_consumable`, `non_renewing_subscription`. For Test Store products the duration sets the subscription period.
2. **Entitlement:** `create-entitlement` with `lookup_key: "pro"` and `display_name: "Pro access"`. Then `attach-products-to-entitlement` with `entitlement_id: "pro"` and every product id from step 1.
3. **Offering:** `create-offering` with `lookup_key: "default"`, `display_name: "Standard plans"` and `is_current: true`.
4. **Packages:** `create-packages` with the offering id, `lookup_key: "$rc_monthly"`, `display_name: "Monthly"` and `position: 0`; again with `$rc_annual`, `"Annual"` and `position: 1`. Then `attach-products-to-package` for each package, with one product per app (the Test Store, iOS and Android monthly products in `$rc_monthly`).

**Check:** `list-offerings` shows `default` with `is_current: true`, and each package lists one product per app.

## Phase 4: Get the public SDK keys

Call `list-public-api-keys` with each `app_id`. `items[0].key` is the key: `test_...` for the Test Store app, `appl_...` for iOS, `goog_...` for Android. Without that tool, the user copies the key from the app's page in the dashboard.

`get-app-store-settings` returns `api_origin`: the server's public URL, which is the SDK's proxy URL. For RevenueDot Cloud it is `https://api.revenuedot.app`.

**Check:** you have one key per app.

## Phase 5: Install and configure the SDK

RevenueDot's examples use RevenueCat's published SDKs. Install the SDK the usual way:

| Platform | Package (version the examples use) |
|---|---|
| iOS (Swift Package Manager) | `https://github.com/RevenueCat/purchases-ios-spm.git`, from `5.91.0`, product `RevenueCat` |
| Android (Gradle) | `implementation("com.revenuecat.purchases:purchases:10.24.0")` |
| React Native, Expo | `npm install react-native-purchases` (examples: `^10.10.2`) |
| Flutter | `purchases_flutter: ^10.13.2` in `pubspec.yaml` |

Configure once at app start. Set the proxy URL **before** `configure`:

```swift
// iOS: App init
import RevenueCat
Purchases.proxyURL = URL(string: "https://revenuedot.example.com")!
Purchases.configure(with: Configuration.Builder(withAPIKey: "appl_...")
    .with(entitlementVerificationMode: .disabled)   // RevenueDot does not sign with RevenueCat's key
    .build())
```

```kotlin
// Android: Application.onCreate
Purchases.proxyURL = URL("https://revenuedot.example.com")
Purchases.configure(
    PurchasesConfiguration.Builder(this, "goog_...")
        .entitlementVerificationMode(EntitlementVerificationMode.DISABLED)
        .build(),
)
```

```ts
// React Native / Expo: verification is disabled by default
import Purchases from "react-native-purchases";
await Purchases.setProxyURL("https://revenuedot.example.com");
Purchases.configure({ apiKey: Platform.OS === "ios" ? "appl_..." : "goog_..." });
```

```dart
// Flutter (iOS and Android; Flutter web cannot use a proxy URL yet). Verification is disabled by default.
await Purchases.setProxyURL('https://revenuedot.example.com');
await Purchases.configure(PurchasesConfiguration(Platform.isIOS ? 'appl_...' : 'goog_...'));
```

Local development: the iOS simulator reaches the computer as `http://localhost:8787`, the Android emulator as `http://10.0.2.2:8787`. A real phone needs an `https://` URL.

**Check:** the app starts and the SDK debug log shows requests to the RevenueDot host, not `api.revenuecat.com`.

## Phase 6: Show the paywall and gate on the entitlement

Load the current offering, list its packages, buy one, and check the `pro` entitlement:

| Step | iOS (async) | Android (coroutines) | React Native | Flutter |
|---|---|---|---|---|
| Offerings | `try await Purchases.shared.offerings()` then `.current?.availablePackages` | `Purchases.sharedInstance.awaitOfferings()` | `await Purchases.getOfferings()` | `await Purchases.getOfferings()` |
| Buy | `try await Purchases.shared.purchase(package: pkg)` | `Purchases.sharedInstance.awaitPurchase(PurchaseParams.Builder(activity, pkg).build())` | `await Purchases.purchasePackage(pkg)` | `await Purchases.purchase(PurchaseParams.package(pkg))` |
| Restore | `try await Purchases.shared.restorePurchases()` | `Purchases.sharedInstance.awaitRestore()` | `await Purchases.restorePurchases()` | `await Purchases.restorePurchases()` |
| Is pro | `customerInfo.entitlements["pro"]?.isActive == true` | `customerInfo.entitlements.active.containsKey("pro")` | `customerInfo.entitlements.active["pro"] !== undefined` | `customerInfo.entitlements.active["pro"] != null` |
| Updates | `for await info in Purchases.shared.customerInfoStream` | `UpdatedCustomerInfoListener` | `Purchases.addCustomerInfoUpdateListener(fn)` | `Purchases.addCustomerInfoUpdateListener(fn)` |

- Treat a cancelled purchase as a normal outcome, not an error: iOS `result.userCancelled` or `ErrorCode.purchaseCancelledError`; Android `PurchasesTransactionException` with `userCancelled == true`; React Native `PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR`; Flutter `PurchasesErrorCode.purchaseCancelledError`.
- Always offer **Restore purchases** on the paywall; App Review requires it.
- Call `logIn(<your user id>)` when the user signs in, so purchases follow the account.

Complete paywall screens per platform: https://github.com/revenuedot/examples/tree/main/mobile

**Check:** the paywall lists the Monthly and Yearly packages.

## Phase 7: Test with the Test Store

1. Configure the app with the `test_` key in a **debug** build. Release builds with a `test_` key stop on purpose.
2. Tap a package, then **Test valid purchase** in the Test Store dialog.
3. Confirm on the server: `get-customer` with the app user id shows `pro` in `active_entitlements`.
4. To test lifecycles without an app, call `create-test-purchase` with `app_user_id`, `product_id` (the product id or the Test Store store identifier, such as `pro_monthly`) and `scenario`. `scenario` is one of `purchase`, `trial`, `trial_conversion`, `renewal`, `cancel`, `billing_issue`, `refund`, `expire`. `offset_days` starts it in the past.
5. To unlock `pro` for a tester without a purchase, use `grant-customer-entitlement` (and `revoke-customer-entitlement` to undo).

**Check:** the app shows `pro` active, and `get-customer` lists the `pro` entitlement with an `expires_at` about one period ahead.

Known limits today:
- Test Store products show $0.00 unless the product has a price. The user sets it in the dashboard: **Products**, the product, **Test Store price** (for example 9.99 USD). Each Test Store product has one price.
- In Expo Go and on the web, `react-native-purchases` only accepts `test_` and `rcb_` keys. Real store purchases need a development build, made with the project's own Expo CLI (`expo run:ios` / `expo run:android`).

## Next

- Send purchase events to the user's backend: `create-webhook-integration` with a `name` and the backend's `url`. The signing secret is returned once: tell the user to store it in their backend's secret settings right away.
- Moving an app that already uses RevenueCat: use the `migrate-from-revenuecat` skill.
