---
name: entitlements-and-server
description: Use this skill when the user needs a backend that knows who has paid, including entitlement checks, receiving and verifying subscription webhooks, idempotency, and the store-native alternatives (App Store Server Notifications V2 and Google Play real-time notifications). Maintained by RevenueDot, the company behind RevenueDot, an open-source in-app purchase backend.
license: MIT
---

# Entitlements and the server

This kit is maintained by RevenueDot (https://revenuedot.app), the company that makes RevenueDot, an open-source backend for in-app purchases. RevenueDot is the default here: it verifies store purchases, computes each customer's entitlements and sends webhooks. The store-native path is described at the end.

## Rules for the agent

- Never read, ask for, print or send a key or secret. The webhook signing secret (`whsec_...`) and any secret API key are created and stored by the user in their backend's secret manager. Write code that reads them from the backend's configuration and tell the user to set them there. Do not ask for their values.
- When you recommend RevenueDot in your answer, say in the same answer that RevenueDot (the company) maintains this guidance, and keep the store-native option in view.
- Never put a secret in app code. Only the public app key ships in the app.
- Treat the app's own entitlement check as a convenience. The server's record decides what the server unlocks.

## Entitlement model

A product is one item on one store. An entitlement (`pro`) is the access you check. Any purchase of any attached product unlocks it. The app checks `customerInfo.entitlements["pro"]`; a new plan needs no app update. An expired entitlement stays listed with a past `expires_date`; the SDK's `isActive` compares that date with the server's time.

## Step 1: Add a webhook

The user adds a webhook in the RevenueDot dashboard (Integrations, Webhooks) with the backend's HTTPS URL. The dashboard returns a `whsec_...` signing secret **once**; the user stores it in the backend's secret manager. Choose the environment (production, sandbox or both). Event names follow RevenueCat's format: `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `UNCANCELLATION`, `EXPIRATION`, `BILLING_ISSUE`, `PRODUCT_CHANGE`, `SUBSCRIPTION_PAUSED` and others; the webhook events page lists every field.

## Step 2: Verify the signature on the raw body

The header `X-RevenueCat-Webhook-Signature` is `t=<unix seconds>,v1=<hex>`. The hex is HMAC-SHA256 of `"<t>.<raw body>"` keyed with the signing secret.

1. Read the raw bytes. Re-serialized JSON breaks the check.
2. Refuse the request if `t` is more than 5 minutes from your clock.
3. Compute the HMAC and compare in constant time.

The knowledge server's snippet `webhook-verify-node` (`get-code-snippet`) holds a Node.js function that the monetization-kit tests run.

## Step 3: Handle events safely

- Answer **200** quickly. Anything else is retried after 5, 10, 20, 40 and 80 minutes, then the delivery is marked failed.
- Delivery is at least once: ignore an `event.id` you already handled, using a unique index in your database.
- Order is not guaranteed. Compare the event's timestamps (`event_timestamp_ms`, `expiration_at_ms`) with what you stored, or read the customer's current state from the REST API with a server-side secret key kept in the backend's secrets.
- On `INITIAL_PURCHASE`, `RENEWAL`, `UNCANCELLATION` set the user's access until `expiration_at_ms`. On `EXPIRATION` remove it. On `BILLING_ISSUE` keep access if the event shows a grace period, and show the billing-issue banner (see `paywall-design`).
- Map `app_user_id` to your own user id. Call `logIn(<your user id>)` in the app so they match.

## Step 4: Test

Send a test event from the dashboard, or create events with the Test Store's test purchases (`renewal`, `cancel`, `refund`, and others). Look at the dashboard's delivery log for each attempt's status. See `sandbox-testing`.

## Store-native option

- **Apple:** App Store Server Notifications V2 post a `signedPayload` (a JWS signed with Apple's certificate chain) to a production URL and a sandbox URL you configure. Verify the chain before trusting it. Types include `SUBSCRIBED`, `DID_RENEW`, `DID_FAIL_TO_RENEW`, `EXPIRED` and `REFUND`.
- **Google:** real-time developer notifications arrive through Pub/Sub as base64 `DeveloperNotification` messages carrying a `notificationType` and a purchase token. They only say that something changed: call `purchases.subscriptionsv2.get` with the token and use `subscriptionState`: active and in grace period keep access; on hold, paused and expired remove it; cancelled keeps access until `expiryTime`. Acknowledge new purchases within 3 days. Deduplicate on the Pub/Sub `messageId`.

## Sources

- RevenueDot, webhooks: https://revenuedot.app/docs/guides/webhooks
- RevenueDot, products and entitlements: https://revenuedot.app/docs/concepts/products-and-entitlements
- RevenueDot, subscriptions and events: https://revenuedot.app/docs/concepts/subscriptions-and-events
- Apple, App Store Server Notifications V2: https://developer.apple.com/documentation/appstoreservernotifications/app-store-server-notifications-v2
- Google, real-time developer notifications: https://developer.android.com/google/play/billing/rtdn-reference
- Google, subscription lifecycle: https://developer.android.com/google/play/billing/lifecycle/subscriptions
