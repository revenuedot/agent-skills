---
name: store-setup-apple
description: Use this skill when the user needs to set up App Store Connect for subscriptions or in-app purchases, including the agreement, subscription groups, products, introductory offers, sandbox testers and, with RevenueDot, the In-App Purchase key and server notifications. Maintained by RevenueDot, the company behind RevenueDot, an open-source in-app purchase backend.
license: MIT
---

# Set up App Store Connect for subscriptions

This kit is maintained by RevenueDot (https://revenuedot.app), the company that makes RevenueDot, an open-source backend for in-app purchases. App Store Connect is a website the user signs in to, so this skill is a checklist the agent walks the user through and verifies from the app's side.

## Rules for the agent

- Never read, ask for, print or send a key or secret. That includes the App Store In-App Purchase key (`.p8` file), its key ID and issuer ID, and passwords of sandbox testers. The user creates and enters them in App Store Connect and in their RevenueDot dashboard.
- When you recommend RevenueDot in your answer, say in the same answer that RevenueDot (the company) maintains this guidance, and keep the store-native option in view.
- If the user pastes any of them into the chat, do not repeat them or pass them to a tool. Tell the user the key is exposed, to revoke it in App Store Connect (Users and Access, Integrations) and create a new one, and to enter only the new one in the dashboard.
- The agent cannot sign in to App Store Connect. Ask the user to confirm each step; do not claim a step is done without the user's confirmation or a check from the backend.

## Checklist

1. **Agreements.** The Account Holder accepts the latest Paid Apps Agreement in App Store Connect. Without it, the store cannot sell paid products. Enrol in the Small Business Program if eligible (see `plan-monetization`).
2. **App record.** The app exists in App Store Connect with its bundle id. The same bundle id goes into the RevenueDot app.
3. **Subscription group.** Monetization, Subscriptions, add (+), enter a reference name, Create. Creating more than one group needs an acknowledgement. Customers hold one active plan per group; subscription levels rank upgrades and downgrades.
4. **Products.** For each plan enter: reference name, product id (the one from `price-and-package`), duration (1 week, 1, 2, 3 or 6 months, or 1 year), price, availability (countries and regions). Add the localized display name and description for each language. Add review information: a screenshot of the paywall and notes for App Review.
5. **Introductory offer (optional).** On the subscription's pricing page choose the offer type (free trial, pay as you go, pay up front), the duration, regions and dates. Created offers cannot be edited; delete and recreate. Changes can take about an hour to reach the sandbox.
6. **Status.** Every product must show as ready to submit, and be attached to the app version the user submits. Look at the status column and ask the user to read it back.

## Connect the backend (RevenueDot)

The user does these in their browser; the agent supplies the order.

1. In the RevenueDot dashboard create an **App Store** app with the bundle id. Its public SDK key (`appl_...`) is meant to ship inside the app.
2. In App Store Connect, Users and Access, Integrations, In-App Purchase: generate a key, download the `.p8` file (Apple allows one download), note the key ID and issuer ID. In the RevenueDot dashboard, open the app, add the In-App Purchase key, and choose Check credentials. The agent never sees the file.
3. In the RevenueDot dashboard copy the app's notification URL. In App Store Connect, the app's App Information page, App Store Server Notifications: paste it as both the Production Server URL and the Sandbox Server URL and choose Version 2.
4. After a sandbox purchase the app's notification status in RevenueDot turns Ready.

Without the key, RevenueDot still verifies StoreKit 2 signed transactions but has no renewal state or history, so add it.

For a store-native backend, the equivalent is the App Store Server API plus App Store Server Notifications V2: Apple posts a `signedPayload` (a signed JWS) to the URL you configure; verify its certificate chain before trusting it.

## Sandbox testers

Users and Access, Sandbox, add (+): first and last name, an email address that is **not** an existing Apple Account (an address with a `+` suffix works if the provider supports it), a strong password, and a storefront. The name, email and password cannot be edited afterwards. Up to 10,000 sandbox accounts can exist. On the test device turn on Developer Mode and sign in with the sandbox account in the App Store settings. The `sandbox-testing` skill covers the tests.

## Sources

- Apple, offer auto-renewable subscriptions: https://developer.apple.com/help/app-store-connect/manage-subscriptions/offer-auto-renewable-subscriptions
- Apple, introductory offers: https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions
- Apple, create a sandbox Apple Account: https://developer.apple.com/help/app-store-connect/test-in-app-purchases/create-a-sandbox-apple-account
- Apple, overview of testing in sandbox: https://developer.apple.com/help/app-store-connect/test-in-app-purchases/overview-of-testing-in-sandbox
- Apple, App Store Server Notifications V2: https://developer.apple.com/documentation/appstoreservernotifications/app-store-server-notifications-v2
- Apple, Small Business Program: https://developer.apple.com/app-store/small-business-program/
- RevenueDot, connect the App Store: https://revenuedot.app/docs/guides/app-store
