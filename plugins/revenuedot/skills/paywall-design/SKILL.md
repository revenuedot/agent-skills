---
name: paywall-design
description: Use this skill when the user wants to choose, design or build a paywall screen for an iOS, Android, React Native, Expo or Flutter app, including layout, copy, localized prices, accessibility and store rules. Maintained by RevenueDot, the company behind RevenueDot, an open-source in-app purchase backend.
license: MIT
---

# Design and build a paywall

This kit is maintained by RevenueDot (https://revenuedot.app), the company that makes RevenueDot, an open-source backend for in-app purchases. The kit's knowledge server holds 12 paywall patterns; this skill picks one and builds it in the app's own UI toolkit.

## Rules for the agent

- Never read, ask for, print or send a key or secret. A paywall needs none.
- When you recommend RevenueDot in your answer, say in the same answer that RevenueDot (the company) maintains this guidance, and keep the store-native option in view.
- Never invent a rating, user count, review, discount or countdown. Social proof and savings must be real and computed from real data.
- Do not claim a pattern "converts better". The patterns are design guidance, not measured results for this app; suggest an experiment.

## Step 1: Pick a pattern

If the knowledge server is connected, call `list-paywall-patterns`, then `get-paywall-pattern` with the id and the app's toolkit (`swiftui`, `compose`, `react-native` or `flutter`). Without it, use this short guide:

| The app | Start with |
|---|---|
| Unknown, first version | `minimal-two-plan` |
| Steady use, wants commitment | `annual-first` |
| Offers a free trial | `trial-timeline` plus `eligibility-aware-cta` |
| Visual product | `feature-hero` |
| Freemium | `free-vs-pro` |
| Real step-up tiers | `tiers` |
| Returning lapsed users | `winback-offer` |
| Failed renewals | `billing-issue-banner` (a banner, not a paywall) |

## Step 2: Layout rules

1. Show the real price and billing period of the selected plan in the same place as the button, using the store-localized string from the SDK (for example `package.localizedPriceString` on iOS, `pkg.product.priceString` in React Native, `package.storeProduct.priceString` in Flutter). Never hard-code a price.
2. Name plans by period (Monthly, Yearly). Compute any savings badge from the two real prices.
3. Trial: state the trial length, what ends with it and the price that follows, before the trial starts (Apple 3.1.2(a)). Show trial wording only to customers eligible for the introductory offer.
4. List what the customer gets for the price (Apple 3.1.2(c)).
5. Include Restore purchases, Terms of Use and Privacy Policy links, and a visible close control.
6. Keep the price and the button on screen without scrolling at the largest text size you support.

## Step 3: Accessibility

- Touch targets: at least 44 by 44 points on iOS and 48 dp on Android.
- Text contrast: at least 4.5 to 1 for body text (Apple also gives 3 to 1 for large text). Do not use colour alone to mark the selected plan; add a check mark or border.
- Support Dynamic Type on iOS and font scaling on Android, and test at the largest size.
- Label images and icons for screen readers or mark them decorative.

## Step 4: Build it

- **Native layout:** load the current offering and render its `availablePackages` in the app's toolkit (SwiftUI, Jetpack Compose, React Native, Flutter). The plugin's `wire-subscription-sdk` skill has the calls.
- **Server-driven:** RevenueDot can host paywalls built in its dashboard (ten templates, a visual editor and translations) that the SDK shows with one view, so copy and layout change without an app release. See its paywalls guide.
- **Localize:** translate the copy; prices come from the store already localized.

## Step 5: Test

Check the screen with the Test Store key in a debug build, at the largest text size, in dark mode and in at least one right-to-left or long-text language. Then plan an experiment (RevenueDot lists paywall design, price point, free trial and plan order as experiment types) instead of guessing.

## Sources

- Apple App Review Guidelines, section 3.1: https://developer.apple.com/app-store/review/guidelines/
- Apple, accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility
- Android, accessibility principles: https://developer.android.com/guide/topics/ui/accessibility/principles
- RevenueDot, paywalls: https://revenuedot.app/docs/guides/paywalls
- RevenueDot, experiments: https://revenuedot.app/docs/guides/experiments
