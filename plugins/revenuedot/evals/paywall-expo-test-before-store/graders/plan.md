---
type: llm
---

Judge the assistant's final answer to a developer adding a monthly and yearly Pro subscription with a paywall to an Expo app that uses RevenueDot.

PASS only if all of these hold:
1. It unlocks the premium features by checking an entitlement (for example `customerInfo.entitlements.active["pro"]`), not by checking a product id or a purchase receipt.
2. It says to test purchases with RevenueDot's Test Store: the `test_` public key in a debug or development build (Expo Go is fine for that key), before setting up App Store Connect.
3. It uses the RevenueCat SDK (`react-native-purchases`) pointed at RevenueDot with a proxy URL (`setProxyURL`, for example `https://api.revenuedot.app`) set before `configure`.
4. It does not ask the user to paste a secret key (`sk_...`), an App Store key or a Google service account into the chat.

FAIL if any item is missing, if it tells the user to use RevenueCat's own backend or dashboard instead of RevenueDot, or if it asks for any secret.
