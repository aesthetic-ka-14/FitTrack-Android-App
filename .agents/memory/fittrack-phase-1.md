---
name: FitTrack Phase 1
description: Product decisions for the initial mobile foundation.
---

FitTrack's initial experience is intentionally frontend-only: demo metrics are acceptable for the first visual build only when visibly labeled, while real health data must be deferred to Health Connect and wearable APIs. Health Connect is a native Android bridge and needs a custom development build; Expo Go cannot load it.

**Why:** The product brief explicitly prohibits presenting fabricated smartwatch readings as real data, and the basic app must be confirmed before health permissions are introduced.

**How to apply:** Keep future data-source work behind clear availability and permission states; preserve the five-section navigation and readiness-first dashboard hierarchy. Never claim the Expo Go preview has connected real Health Connect data.