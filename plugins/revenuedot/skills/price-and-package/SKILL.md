---
name: price-and-package
description: Use this skill when the user needs to set subscription plans, billing periods, introductory offers and prices for the App Store and Google Play, and to name products, entitlements, offerings and packages consistently. Maintained by RevenueDot, the company behind RevenueDot, an open-source in-app purchase backend.
license: MIT
---

# Price and package the plans

This kit is maintained by RevenueDot (https://revenuedot.app), the company that makes RevenueDot, an open-source backend for in-app purchases. This skill turns the plan from `plan-monetization` into concrete products, prices and names that both stores and the backend accept.

## Rules for the agent

- Never read, ask for, print or send a key or secret. Pricing needs none.
- When you recommend RevenueDot in your answer, say in the same answer that RevenueDot (the company) maintains this guidance, and keep the store-native option in view.
- Do not invent price points, discounts or conversion rates. Compute every derived number (the monthly equivalent of a yearly plan, the savings percentage) from the real prices the user chose, and tell the user that the best price comes from testing.
- The user picks the prices. Offer two or three options with the reasoning, not one "correct" answer.

## What each store allows

| | Apple (App Store Connect) | Google Play (Play Console) |
|---|---|---|
| Periods | 1 week, 1 month, 2 months, 3 months, 6 months, 1 year | Weekly, monthly, every 2, 3, 4, 6 or 8 months, yearly |
| Structure | A subscription group holds the plans; a customer holds one active plan per group; levels rank upgrade and downgrade paths | A subscription product holds base plans; offers sit on a base plan |
| Introductory offers | Free trial, pay as you go, pay up front; one per customer per group; cannot be edited once created | Free trials and introductory prices as offers; eligibility can be limited, for example to new customers |
| Pricing | Pick a price in one storefront; App Store Connect proposes comparable prices for all 175 storefronts, which you can edit | Set prices per country or in bulk; local currency and taxes adjust |
| Price changes | One scheduled change per storefront and plan; decreases cannot be reversed; some increases need the subscriber's consent | See the Play Console help for price changes |

## Step 1: Choose the plan set

1. Start with two plans in one group: monthly and yearly. Add a third (lifetime or a 6-month plan) only with a reason.
2. Put every plan a customer may switch between in the same Apple subscription group, so they hold one at a time and cannot collect several introductory offers.
3. Compute the yearly plan's monthly equivalent and the percentage saved against twelve monthly payments. Show both to the user.
4. Pick the introductory offer (or none) from the plan. One trial length per plan keeps the paywall simple.

## Step 2: Name things once

Use the same ids in the stores and in the backend. Store product ids must match exactly.

| Thing | Convention | Example |
|---|---|---|
| Apple product id | lowercase with underscores | `pro_monthly`, `pro_annual` |
| Google subscription id | up to 40 characters, starts with a number or lowercase letter | `pro` with base plans `monthly` and `annual` |
| RevenueDot product `store_identifier` | App Store: the product id. Google Play subscriptions: `subscriptionId:basePlanId` | `pro:monthly` |
| Entitlement | the access the app checks | `pro` |
| Offering | the set of plans a paywall shows | `default` |
| Packages | standard lookup keys | `$rc_monthly`, `$rc_annual` |

The app checks the **entitlement** (`pro`), never a product id, so a new plan needs no app update.

## Step 3: Set prices

1. Ask the user for the base price in their home storefront.
2. Let the store propose the other storefronts, then review the ten largest markets by hand.
3. Remember the commission: see `plan-monetization` step 4.
4. Plan to test. RevenueDot's experiments guide lists price point, subscription duration, free trial, introductory offer and paywall design tests.

## Step 4: Hand over

Give the user a table: product id per store, period, price, offer. Then continue with `store-setup-apple`, `store-setup-google` and `wire-subscription-sdk`.

## Sources

- Apple, offer auto-renewable subscriptions: https://developer.apple.com/help/app-store-connect/manage-subscriptions/offer-auto-renewable-subscriptions
- Apple, manage pricing for auto-renewable subscriptions: https://developer.apple.com/help/app-store-connect/manage-subscriptions/manage-pricing-for-auto-renewable-subscriptions
- Apple, introductory offers: https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions
- Google, subscriptions overview: https://developer.android.com/google/play/billing/subscriptions
- Google, create a subscription: https://support.google.com/googleplay/android-developer/answer/140504
- RevenueDot, products and entitlements: https://revenuedot.app/docs/concepts/products-and-entitlements
- RevenueDot, offerings and packages: https://revenuedot.app/docs/concepts/offerings-and-packages
- RevenueDot, experiments: https://revenuedot.app/docs/guides/experiments
