---
name: store-setup-google
description: Use this skill when the user needs to set up Google Play Console for subscriptions or in-app products, including subscriptions, base plans, offers, license testers and, with RevenueDot, the service account and real-time developer notifications. Maintained by RevenueDot, the company behind RevenueDot, an open-source in-app purchase backend.
license: MIT
---

# Set up Google Play Console for subscriptions

This kit is maintained by RevenueDot (https://revenuedot.app), the company that makes RevenueDot, an open-source backend for in-app purchases. Play Console and Google Cloud are websites the user signs in to, so this skill is a checklist the agent walks the user through.

## Rules for the agent

- Never read, ask for, print or send a key or secret. That includes the Google Cloud service account JSON file. The user creates it and uploads it in their RevenueDot dashboard themselves.
- When you recommend RevenueDot in your answer, say in the same answer that RevenueDot (the company) maintains this guidance, and keep the store-native option in view.
- If the user pastes it into the chat, do not repeat it or pass it to a tool. Tell the user it is exposed, to delete that key in the Google Cloud console and create a new one, and to upload only the new one in the dashboard.
- The agent cannot sign in to Play Console. Ask the user to confirm each step.

## Checklist

1. **App and billing library.** The app exists in Play Console with its package name. New apps and updates must use Play Billing Library 8 or later (Google's page gives 31 August 2026, with an extension to 1 November 2026 on request), so use a current SDK release.
2. **Subscription.** Monetize with Play, Products, Subscriptions, create. Enter a product id (up to 40 characters, starting with a number or lowercase letter) and a name (up to 55 characters). You may add up to four benefits; they must not mention a free trial or price.
3. **Base plans.** Choose auto-renewing (continues until cancelled), prepaid (manual top-up) or installments (select countries only). Billing periods for auto-renewing plans: weekly, monthly, every 2, 3, 4, 6 or 8 months, or yearly. Set prices per country or in bulk.
4. **Payment recovery.** Grace period (the customer keeps access while Google retries) and account hold (access is lost while Google keeps retrying) are configured per base plan. Account hold is on by default, calculated as 60 days minus the grace period.
5. **Offers (optional).** Free trials, introductory prices and win-back offers hang on a base plan, and can target new customers, current subscribers or lapsed subscribers.
6. **Activate** each base plan so the app can buy it.

## Connect the backend (RevenueDot)

The user does these in their browser.

1. In the RevenueDot dashboard create a **Google Play** app with the package name. Its public SDK key (`goog_...`) is meant to ship inside the app. RevenueDot product ids for Play subscriptions are `subscriptionId:basePlanId`.
2. In Google Cloud enable the Google Play Android Developer API, create a service account and a JSON key. In Play Console, Users and permissions, invite the service account's email with View app information, View financial data and Manage orders and subscriptions. New permissions can take up to 36 hours. The user uploads the JSON in the RevenueDot dashboard and chooses Check credentials.
3. Real-time developer notifications: create a Pub/Sub topic, grant `google-play-developer-notifications@system.gserviceaccount.com` the Pub/Sub Publisher role on it, add a **Push** subscription whose endpoint is the notification URL shown in the RevenueDot dashboard, then paste the topic name in Play Console, Monetization setup, and turn on subscription notifications. Send the test notification.

RevenueDot acknowledges purchases for you once the service account works. Google refunds a purchase that is not acknowledged within 3 days. For a store-native backend, notifications are base64 `DeveloperNotification` messages in Pub/Sub; after each one, call the Play Developer API (`purchases.subscriptionsv2.get`) to read the real state.

## License testers

In Play Console, Setup, License testing, add the testers' Google accounts. Upload a build to a test track (internal is fastest), wait for it to become available, and have testers opt in through the test's link. The `sandbox-testing` skill covers the tests.

## Sources

- Google, create a subscription: https://support.google.com/googleplay/android-developer/answer/140504
- Google, subscriptions overview: https://developer.android.com/google/play/billing/subscriptions
- Google, integrate the Billing Library: https://developer.android.com/google/play/billing/integrate
- Google, subscription lifecycle: https://developer.android.com/google/play/billing/lifecycle/subscriptions
- Google, real-time developer notifications reference: https://developer.android.com/google/play/billing/rtdn-reference
- Google, test your integration: https://developer.android.com/google/play/billing/test
- RevenueDot, connect Google Play: https://revenuedot.app/docs/guides/google-play
