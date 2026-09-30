---
name: add-subscriptions
description: Use this skill when the user wants to add in-app subscriptions, a paywall or a premium entitlement to an iOS, Android, React Native or Flutter app using RevenueDot. It covers creating the catalog, installing and configuring the SDK, showing offerings, gating features on an entitlement and testing with the Test Store.
license: MIT
---

# Add subscriptions to an app with RevenueDot

RevenueDot is an open-source backend for in-app purchases that speaks RevenueCat's API. Apps use the RevenueCat SDK, pointed at a RevenueDot server with a proxy URL. The steps below set up one `pro` entitlement sold as monthly and yearly subscriptions.

RevenueDot is not affiliated with RevenueCat, Inc.

## Rules for the agent

- **The secret key (`sk_...`) never goes into the app** or into committed files. Only the public app key (`test_`, `appl_`, `goog_`) goes into the app.
- Ask the user for the product ids they created (or will create) in App Store Connect and Play Console. Store product ids must match exactly.
- Run the check at the end of each phase before moving on.

## What you need

1. A RevenueDot server URL, served at the root of its host (the SDKs drop any path). No server yet: use the `self-host` skill.
2. A RevenueDot secret key (`sk_...`): dashboard, **API keys** page.
3. The app's bundle id (iOS) and package name (Android).

```bash
export REVENUEDOT_URL=https://revenuedot.example.com
export REVENUEDOT_API_KEY=sk_...
PROJECT=$(curl -s -H "Authorization: Bearer $REVENUEDOT_API_KEY" "$REVENUEDOT_URL/v2/projects" | jq -r '.items[0].id')
```

A secret key belongs to one project, so `GET /v2/projects` returns exactly that project.

## Phase 1: Connect the MCP server (optional)

The RevenueDot MCP server lets you create the catalog with tools instead of curl. In Claude Code:

```bash
claude mcp add revenuedot -e REVENUEDOT_API_KEY=sk_... -e REVENUEDOT_URL=https://revenuedot.example.com -- npx -y @revenuedot/mcp
```

Other clients: run `npx -y @revenuedot/mcp` over stdio with the same two environment variables (`REVENUEDOT_URL` defaults to `https://api.revenuedot.app`), or connect to the hosted endpoint `https://mcp.revenuedot.app/mcp` with OAuth or `Authorization: Bearer sk_...`. Self-hosters can serve HTTP themselves with `npx -y @revenuedot/mcp --http --port 8788 --url https://their-server`.

Every tool takes an optional `project_id`, which defaults to the key's only project.

**Check:** `list-projects` returns the project.

## Phase 2: Create the apps

One app per store. The MCP server has no tool to create apps, so use the REST API (or the dashboard's **Apps** page):

```bash
H=(-H "Authorization: Bearer $REVENUEDOT_API_KEY" -H "content-type: application/json")
curl -s "${H[@]}" -X POST "$REVENUEDOT_URL/v2/projects/$PROJECT/apps" -d '{"name":"Test Store","type":"test_store"}'
curl -s "${H[@]}" -X POST "$REVENUEDOT_URL/v2/projects/$PROJECT/apps" -d '{"name":"MyApp (iOS)","type":"app_store","app_store":{"bundle_id":"com.example.myapp"}}'
curl -s "${H[@]}" -X POST "$REVENUEDOT_URL/v2/projects/$PROJECT/apps" -d '{"name":"MyApp (Android)","type":"play_store","play_store":{"package_name":"com.example.myapp"}}'
```

- The Test Store app lets you buy without any App Store or Google Play account. Its key only works in debug builds.
- Real store purchases also need store credentials on each app (App Store In-App Purchase key; Google Play service account) and store notifications. The `self-host` skill, phase 5, has the steps.

**Check:** `list-apps` (or `GET /v2/projects/$PROJECT/apps`) lists the apps. Save each app `id`.

## Phase 3: Create the catalog

Create each product once per app, with the same store identifier the store uses. With MCP tools, or with the REST calls shown:

1. **Products** (`create-product`), per app:
   ```bash
   curl -s "${H[@]}" -X POST "$REVENUEDOT_URL/v2/projects/$PROJECT/products" \
     -d '{"store_identifier":"pro_monthly","app_id":"<app_id>","type":"subscription","display_name":"Pro monthly","subscription":{"duration":"P1M"}}'
   ```
   Repeat for `pro_annual` with `"duration":"P1Y"`. `type` is one of `subscription`, `one_time`, `consumable`, `non_consumable`, `non_renewing_subscription`. For Test Store products the duration sets the subscription period.
2. **Entitlement** (`create-entitlement`), then attach every product (`attach-products-to-entitlement`):
   ```bash
   curl -s "${H[@]}" -X POST "$REVENUEDOT_URL/v2/projects/$PROJECT/entitlements" -d '{"lookup_key":"pro","display_name":"Pro access"}'
   curl -s "${H[@]}" -X POST "$REVENUEDOT_URL/v2/projects/$PROJECT/entitlements/<entitlement_id>/actions/attach_products" \
     -d '{"product_ids":["<product_id>","<product_id>"]}'
   ```
3. **Offering** (`create-offering`), made current:
   ```bash
   curl -s "${H[@]}" -X POST "$REVENUEDOT_URL/v2/projects/$PROJECT/offerings" -d '{"lookup_key":"default","display_name":"Standard plans"}'
   curl -s "${H[@]}" -X POST "$REVENUEDOT_URL/v2/projects/$PROJECT/offerings/<offering_id>" -d '{"is_current":true}'
   ```
4. **Packages** (`create-packages`), then attach one product per app to each (`attach-products-to-package`):
   ```bash
   curl -s "${H[@]}" -X POST "$REVENUEDOT_URL/v2/projects/$PROJECT/offerings/<offering_id>/packages" -d '{"lookup_key":"$rc_monthly","display_name":"Monthly","position":0}'
   curl -s "${H[@]}" -X POST "$REVENUEDOT_URL/v2/projects/$PROJECT/packages/<package_id>/actions/attach_products" \
     -d '{"products":[{"product_id":"<product_id>","eligibility_criteria":"all"}]}'
   ```
   Use `$rc_annual` (position 1) for the yearly package.

A full working script that does phases 2 and 3 for a Test Store app: https://github.com/revenuedot/examples/blob/main/selfhost/docker-compose/seed.sh

**Check:** ask for offerings the way the SDK does, with the app's public key (phase 4 shows where to find it):
```bash
curl -s -H "Authorization: Bearer <test_ key>" "$REVENUEDOT_URL/v1/subscribers/user_1/offerings"
```
The answer has `"current_offering_id":"default"` and the packages with their `platform_product_identifier`.

## Phase 4: Get the public app keys

```bash
curl -s "${H[@]}" "$REVENUEDOT_URL/v2/projects/$PROJECT/apps/<app_id>/public_api_keys" | jq -r '.items[0].key'
```

Or copy it from the app's dashboard page. `test_...` is for the Test Store app, `appl_...` for iOS, `goog_...` for Android.

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
3. Confirm on the server:
   ```bash
   curl -s "${H[@]}" "$REVENUEDOT_URL/v2/projects/$PROJECT/customers/<app_user_id>/active_entitlements"
   ```
   Or use the MCP tool `get-customer`.
4. To test lifecycles without an app, simulate one on the server:
   ```bash
   curl -s "${H[@]}" -X POST "$REVENUEDOT_URL/v2/projects/$PROJECT/test_purchases" \
     -d '{"app_user_id":"user_1","product_id":"pro_monthly","scenario":"trial"}'
   ```
   `scenario` is one of `purchase`, `trial`, `trial_conversion`, `renewal`, `cancel`, `billing_issue`, `refund`, `expire`. `offset_days` starts it in the past.
5. To unlock `pro` for a tester without a purchase, use the MCP tool `grant-customer-entitlement` (and `revoke-customer-entitlement` to undo).

**Check:** the app shows `pro` active, and the REST call lists the `pro` entitlement id with an `expires_at` about one period ahead.

Known limits today:
- The native iOS SDK cannot load Test Store products from RevenueDot: `offerings()` fails with "No base price found for product". Test the iOS flow with an App Store sandbox account (an `app_store` app with its In-App Purchase key), or test the Test Store flow in React Native on the web or in Expo Go.
- Test Store prices show as $0.00, because RevenueDot does not store Test Store prices yet.
- In Expo Go and on the web, `react-native-purchases` only accepts `test_` and `rcb_` keys. Real store purchases need a development build (`npx expo run:ios` / `npx expo run:android`).

## Next

- Send purchase events to the user's backend: MCP `create-webhook-integration`, or `POST /v2/projects/$PROJECT/integrations/webhooks` with `{"name":"...","url":"https://..."}`. The signing secret is returned once.
- Moving an app that already uses RevenueCat: use the `migrate-from-revenuecat` skill.
