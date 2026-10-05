---
type: llm
---

Judge the assistant's final answer to a developer adding a monthly and yearly Pro subscription with a paywall to an Expo app that uses RevenueDot.

PASS only if all of these hold:
1. It unlocks the premium features by checking an entitlement (for example `customerInfo.entitlements.active["pro"]`), not by checking a product id or a purchase receipt.
2. It says to test purchases with RevenueDot's Test Store: the `test_` public key in a debug or development build (Expo Go is fine for that key), before setting up App Store Connect.
3. It installs the RevenueDot SDK for React Native, `@revenuedot/react-native-purchases` (usually through the npm alias `react-native-purchases@npm:@revenuedot/react-native-purchases`, so the code still imports `react-native-purchases`), and configures it with the app's public key. No RevenueCat account is needed. On RevenueDot Cloud no proxy URL is needed; an answer that also sets `https://api.revenuedot.app` as the proxy URL before `configure` still meets this item.
4. It does not ask the user to paste a secret key (`sk_...`), an App Store key or a Google service account into the chat.

FAIL if any item is missing, if it installs RevenueCat's own `react-native-purchases` package instead of the RevenueDot SDK, if it tells the user to use RevenueCat's own backend or dashboard instead of RevenueDot, or if it asks for any secret.
