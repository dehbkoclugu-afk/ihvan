# İhvan design release checklist

The design contract is release-blocking. Every build is checked against 20 critical scenarios in `critical-screens.json`, in Turkish, English and Arabic; dawn and vigil themes; and 320 px, 412 px and 800 px widths.

## Layout and interaction

- Safe-area insets remain owned by `Screen` and the tab layout. No screen adds a second status-bar offset.
- Tab screens use the dynamic tab-bar inset and hide the bar while the keyboard is open.
- Interactive controls are at least 44 × 44 points and expose role, label and selected/disabled state.
- Repeated choices use `SegmentedControl`; repeated actions use the shared button variants; progress uses `ProgressBar`.
- Disabled actions use explicit neutral colors rather than opacity alone.
- The 4/8/12/16/24/32 spacing scale, shared radii and semantic theme colors are mandatory.

## Type, Quran and art

- Fraunces is reserved for display hierarchy; body and control text use Figtree.
- Turkish and Arabic labels must fit one line inside segmented controls at the small viewport.
- Arabic text is RTL, selectable, and measured from native line layout. The Today card previews at most seven lines and always links to the full reader.
- Percent values are written as `0%`, while progress also exposes a semantic accessibility value.
- Art uses verified source dimensions, focus-aware cover cropping, per-theme focal overrides and a branded fallback.
- Empty decorative banners are not shipped. Text over art must use the slot scrim and the artwork foreground tokens.

## Screen gates

- Today: long name, long verse, zero/partial/full progress and all four ritual states.
- Quran: empty and active goals, direct verse search, meal search, filters, bookmarks, compact/expanded hatim plan.
- Reader: small/medium/large Arabic, translation off/TR/EN, bookmark/read, previous/next navigation.
- Worship: denied/granted location, next prayer, notifications, qibla calibration, full-card dhikr target and separate history/reset actions.
- Notes: empty art, create/edit/delete, 1000-character limit, save feedback.
- Profile: unchanged/changed name, `0%` history, all segmented preferences, export feedback and Plus entry.
- Plus: secret-free APK explanation and real Play Store catalog, purchase, pending, cancellation and restore states.

## Manual sign-off

- TalkBack traversal and spoken state checked on one Android phone.
- Font scaling checked at 100% and 130%; large Quran text checked separately.
- Keyboard, rotation and Android back behavior checked on every form/modal.
- Crop reference screenshots compared for onboarding, daily ayah, continue, dhikr, journal and Plus slots.
- Store-backed plans verified only in the Play internal-test build; the downloadable preview APK remains secret-free.
