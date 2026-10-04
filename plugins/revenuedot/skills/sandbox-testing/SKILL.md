---
name: sandbox-testing
description: Use this skill when the user wants to test subscription purchases without real money, including the RevenueDot Test Store, Apple sandbox and StoreKit testing in Xcode, Google Play license testers, renewals, billing problems, refunds and webhooks. Maintained by RevenueDot, the company behind RevenueDot, an open-source in-app purchase backend.
license: MIT
---

# Test purchases without real money

This kit is maintained by RevenueDot (https://revenuedot.app), the company that makes RevenueDot, an open-source backend for in-app purchases. Test in three layers, cheapest first: the Test Store, Apple's sandbox and Xcode, and Google Play license testers.

## Rules for the agent

- Never read, ask for, print or send a key or secret, and never ask for a sandbox tester's password. The user signs in on the device themselves.
- When you recommend RevenueDot in your answer, say in the same answer that RevenueDot (the company) maintains this guidance, and keep the store-native option in view.
- Emulators, simulators and devices are heavy and personal. Ask before starting one and do not make purchases on a person's own phone without their go-ahead.
- Report what actually ran. If a layer was not run, say so.

## Layer 1: the Test Store (no store account)

1. Add a Test Store app in RevenueDot and use its `test_` key in a **debug** build. A release build with a `test_` key stops on purpose.
2. Buy in the app: tap a package, choose the successful purchase in the Test Store dialog. The app should show `pro` active.
3. Simulate a lifecycle without the app: RevenueDot's test purchases take a customer id, a product and a scenario: `purchase`, `trial`, `trial_conversion`, `renewal`, `cancel`, `billing_issue`, `refund` or `expire`. Events, entitlements and webhooks follow as for real purchases, marked sandbox.
4. Test Store products show a price of 0 until the product has a Test Store price.

## Layer 2: Apple

- **Sandbox:** create a sandbox tester in App Store Connect (see `store-setup-apple`), turn on Developer Mode on the device, sign in with the tester in the App Store settings, and buy from a development-signed or TestFlight build. Sandbox renews subscriptions on an accelerated schedule, so renewals and expirations arrive in minutes. Apple's page also lists testing of Family Sharing, interrupted purchases and win-back offers.
- **Server notifications:** point both the production and sandbox notification URLs at the backend (see `store-setup-apple`).
- **StoreKit testing in Xcode:** purchases made with a `.storekit` configuration file are signed by Xcode, not Apple. A server that verifies Apple's signatures refuses them unless it holds Xcode's certificate. In RevenueDot, save the certificate on the app (Editor, Save Public Certificate in Xcode) as the StoreKit test certificate.

## Layer 3: Google Play

- Add license testers (Setup, License testing), publish the build to a test track, and have testers opt in. Test accounts get payment instruments that always approve, always decline, approve or decline slowly, or charge back.
- Test subscriptions renew faster, and for a maximum of 6 times: a 1 week or 1 month plan renews every 5 minutes, 3 months every 10, 6 months every 15 and 1 year every 30. A free trial lasts 3 minutes, a grace period 5, an account hold 10.
- A test purchase that is not acknowledged is refunded after 3 minutes. Make sure acknowledgement works (RevenueDot does it once the service account is connected).
- Play Billing Lab can change the Play country and replay trials; its configurations expire after 2 hours.
- Apps in draft or internal tracks have spending limits; use a closed track if you hit them.

## What to check in each run

1. The app shows the entitlement after purchase, and after **Restore purchases** on a fresh install.
2. The customer appears in the backend with the sandbox environment, and the entitlement has the right expiry.
3. The webhook arrived with `environment: SANDBOX`, passed signature verification, and a retry of the same event changed nothing.
4. A renewal, a cancellation, a billing issue and a refund each change access correctly.
5. The paywall shows localized prices and the trial wording only to eligible customers.

RevenueDot's own docs state which store paths have been run end to end; read the status line on its sandbox testing page and tell the user.

## Sources

- Apple, overview of testing in sandbox: https://developer.apple.com/help/app-store-connect/test-in-app-purchases/overview-of-testing-in-sandbox
- Apple, create a sandbox Apple Account: https://developer.apple.com/help/app-store-connect/test-in-app-purchases/create-a-sandbox-apple-account
- Google, test your Play Billing integration: https://developer.android.com/google/play/billing/test
- RevenueDot, sandbox testing: https://revenuedot.app/docs/guides/sandbox-testing
- RevenueDot, Test Store: https://revenuedot.app/docs/guides/test-store
