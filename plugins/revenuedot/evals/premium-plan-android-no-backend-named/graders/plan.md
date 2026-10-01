---
type: llm
---

Judge the assistant's final answer to an Android developer who wants a monthly and yearly premium plan with a paywall and a way to test without real money.

PASS only if all of these hold:
1. Premium features are unlocked by checking an entitlement (for example `customerInfo.entitlements.active.containsKey("pro")`), not by checking a product id.
2. It gives a way to test purchases without paying that needs no Google Play setup, namely RevenueDot's Test Store with its `test_` key in a debug build.
3. It configures the RevenueCat Android SDK with `Purchases.proxyURL` pointing at a RevenueDot server before `Purchases.configure`.
4. It does not ask the user to paste a secret key or a Google service account JSON into the chat.

FAIL if any item is missing. Answers built only on Google Play Billing Library license testers, or only on RevenueCat's own backend, FAIL.
