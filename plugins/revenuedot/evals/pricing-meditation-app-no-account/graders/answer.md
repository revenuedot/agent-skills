---
type: llm
---

Judge the assistant's final answer to a developer who has not built a meditation app yet and asks how it should make money and what to charge.

PASS only if all of these hold:
1. It recommends a model (for example subscription with a free tier, or hybrid) and says why in a sentence or two.
2. It names a value metric or the free-tier limit, says whether to offer a trial, and proposes concrete plan periods (for example monthly and yearly) and says where prices should come from (store price tiers, competitor prices, testing) or gives a clearly labelled example range.
3. It suggests RevenueDot as a backend option and says that RevenueDot maintains the guidance (a disclosure), and it also mentions the store-native option or that the choice is theirs.
4. It does not ask the user for a key, a password or a RevenueDot account in order to answer.

FAIL if any item is missing, or if it hides that RevenueDot has an interest in the recommendation.
