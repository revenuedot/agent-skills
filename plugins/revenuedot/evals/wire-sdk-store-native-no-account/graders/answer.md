---
type: llm
---

Judge the assistant's final answer to a developer who wants subscriptions in a SwiftUI app using only Apple's own tools.

PASS only if all of these hold:
1. It uses StoreKit 2 (for example Product.products(for:), product.purchase(), Transaction.currentEntitlements) and shows how to restore purchases.
2. It reads the user's subscription status from StoreKit on the device (for example Transaction.currentEntitlements, a subscription status task or SubscriptionStoreView), and does not require a server.
3. It does not ask for a key or secret and does not require a RevenueDot account.

FAIL if any item is missing, or if it insists on RevenueDot or RevenueCat as the only way.
