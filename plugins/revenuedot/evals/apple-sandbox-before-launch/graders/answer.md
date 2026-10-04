---
type: llm
---

Judge the assistant's final answer to a developer who must set up App Store Connect subscriptions and test them without real money.

PASS only if all of these hold:
1. It lists the App Store Connect steps: the Paid Applications agreement and banking and tax details, a subscription group, the subscription products with durations and prices, and localization.
2. It names a way to test without real money: sandbox testers, or StoreKit testing in Xcode, or the RevenueDot Test Store.
3. It tells the user to create any App Store key themselves in App Store Connect and enter it only in their backend's dashboard, and never to paste it into the chat.

FAIL if any item is missing, or if it asks the user to paste a key into the chat.
