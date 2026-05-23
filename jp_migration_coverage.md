# JP Migration Coverage Tracker

## Status Legend
- TODO: not started
- WIP: in progress
- DONE: completed
- N/A: not applicable (with reason)

## Phase 1 GUI/i18n
| Area | Current File | Old JP Reference | Status | Notes |
|---|---|---|---|---|
| Locale dictionary baseline | src/gui/app/lang/locale-ja.json | old_jp_source/src/gui/app/lang/locale-ja.json | DONE | Baseline copied |
| Locale key audit report | jp_locale_key_audit.md | old_jp_source/src/gui/app/lang/locale-ja.json | DONE | Missing in ja=0, Extra in ja=67 |
| App language preference | src/gui/app/app-main.js | old_jp_source/src/gui/app/app-main.js | DONE | ja preferred + en fallback |
| Date modal locale format | src/gui/app/directives/modals/misc/dateModal.js | old_jp_source/src/gui/app/directives/modals/misc/dateModal.js | DONE | yyyy/MM/dd for ja-JP |
| Quote modal locale format | src/gui/app/directives/modals/quotes/addOrEditQuoteModal.js | old_jp_source/src/gui/app/directives/modals/quotes/addOrEditQuoteModal.js | DONE | yyyy/MM/dd for ja-JP |
| Events template text | src/gui/app/templates/live-events/_events.html | old_jp_source/src/gui/app/templates/live-events/_events.html | DONE | High-priority strings migrated |
| Commands template text | src/gui/app/templates/chat/_commands.html | old_jp_source/src/gui/app/templates/chat/_commands.html | DONE | High-priority strings migrated |
| Roles/Ranks template text | src/gui/app/templates/_roles-and-ranks.html | old_jp_source/src/gui/app/templates/_roles-and-ranks.html | DONE | High-priority strings migrated |
| Timers template text | src/gui/app/templates/_timers.html | old_jp_source/src/gui/app/templates/_timers.html | DONE | High-priority strings migrated |

## Phase 2 Time localization
| Area | Current File | Old JP Reference | Status | Notes |
|---|---|---|---|---|
| Time range weekday compatibility | src/backend/restrictions/builtin/time-range.ts | old_jp_source/src/backend/restrictions/builtin/time-range.js | DONE | Accepts legacy ja weekday labels via normalization |
| Date/time widget locale | src/backend/overlay-widgets/builtin-types/current-date-time/current-date-time.ts | old_jp_source equivalent | DONE | DateTime.now().setLocale("ja") |
| Countdown date locale | src/backend/overlay-widgets/builtin-types/countdown-to-date/countdown-to-date.ts | old_jp_source equivalent | DONE | stateDisplay/toHuman locale set to ja |

## Phase 3 Compatibility labels
| Area | Current File | Old JP Reference | Status | Notes |
|---|---|---|---|---|
| Comparison constants compatibility | src/shared/filter-constants.js | old_jp_source/src/shared/filter-constants.js | DONE | LegacyComparisonTypeMap added |
| Filter comparison normalization | src/backend/events/filters/filter-factory.ts | old_jp_source/src/shared/filter-helpers.js | DONE | Predicate path normalization added |

## Phase 4 JP-only features
| Area | Current File | Old JP Reference | Status | Notes |
|---|---|---|---|---|
| JP effects registration | src/backend/effects/builtin-effect-loader.js | old_jp_source/src/backend/effects/builtin-effect-loader.js | DONE | All JP-only effects from old_jp_source registered |
| JP-only effect modules import | src/backend/effects/builtin/* | old_jp_source/src/backend/effects/builtin/* | DONE | Imported: call-layna, call-vtubestudio, onecomme-transfer, onecomme-wordparty, play-bouyomichan, send-vrchat, gpt-yncneo, play-yncneo, translate-yncneo, play-voicevox, play-voicevox-nemo, play-sharevox, play-itvoice, play-lmroid, play-coeiroink-v1, play-coeiroink-v2 |
| JP effect category constant | src/shared/effect-constants.js | old_jp_source/src/shared/effect-constants.js | DONE | EffectCategory.JP_ORIGINAL added |

## Phase 5 Expanded Effect Localization Audit
| Area | Current File | Old JP Reference | Status | Notes |
|---|---|---|---|---|
| Expanded audit baseline | src/backend/effects/builtin/* | old_jp_source/src/backend/effects/builtin/* | WIP | Candidate files reduced 29 -> 10 |
| Effect localization | src/backend/effects/builtin/activity-feed-alert.ts | old_jp_source/src/backend/effects/builtin/activity-feed-alert.ts | DONE | UI/validator/activity-feed labels localized |
| Effect localization | src/backend/effects/builtin/add-quote.ts | old_jp_source/src/backend/effects/builtin/add-quote.ts | DONE | Quote labels/errors/default game name localized |
| Effect localization | src/backend/effects/builtin/custom-script.js | old_jp_source/src/backend/effects/builtin/custom-script.js | DONE | Effect definition localized |
| Effect localization | src/backend/effects/builtin/log-message.ts | old_jp_source/src/backend/effects/builtin/log-message.ts | DONE | UI/validator strings localized |
| Effect localization | src/backend/effects/builtin/api.js | old_jp_source/src/backend/effects/builtin/api.js | DONE | Display/location/dimension/validation warning strings localized |
| Effect localization | src/backend/effects/builtin/celebration.js | old_jp_source/src/backend/effects/builtin/celebration.js | DONE | Name/description/duration/help/validation localized |
| Effect localization | src/backend/effects/builtin/control-emulation.js | old_jp_source/src/backend/effects/builtin/control-emulation.js | DONE | Name/description/UI/validation/help text localized |
| Effect localization | src/backend/effects/builtin/toggle-command.ts | old_jp_source/src/backend/effects/builtin/toggle-command.ts | DONE | Command/tag/toggle UI and validator/default labels localized |
| Effect localization | src/backend/effects/builtin/pause-resume-effect-queue.ts | old_jp_source/src/backend/effects/builtin/pause-resume-effect-queue.ts | DONE | Queue/action/pause-option UI and validator localized |
| Effect localization | src/backend/effects/builtin/update-role.ts | old_jp_source/src/backend/effects/builtin/update-role.ts | DONE | Role action/viewer selection UI labels localized |
| Effect localization | src/backend/effects/builtin/conditional-effects/conditional-effects.js | old_jp_source/src/backend/effects/builtin/conditional-effects/conditional-effects.js | DONE | IF/ELSE UI and modal labels localized |
| Condition localization | src/backend/effects/builtin/conditional-effects/conditions/builtin/args-count.js | old_jp_source/src/backend/effects/builtin/conditional-effects/conditions/builtin/args-count.js | DONE | Name/description localized |
| Condition localization | src/backend/effects/builtin/conditional-effects/conditions/builtin/custom.js | old_jp_source/src/backend/effects/builtin/conditional-effects/conditions/builtin/custom.js | DONE | Name/description localized |
| Condition localization | src/backend/effects/builtin/conditional-effects/conditions/builtin/follow-check.js | old_jp_source/src/backend/effects/builtin/conditional-effects/conditions/builtin/follow-check.js | DONE | Name/description localized |
| Condition localization | src/backend/effects/builtin/conditional-effects/conditions/builtin/username.js | old_jp_source/src/backend/effects/builtin/conditional-effects/conditions/builtin/username.js | DONE | Name/description localized |
| Condition localization | src/backend/effects/builtin/conditional-effects/conditions/builtin/viewer-roles.js | old_jp_source/src/backend/effects/builtin/conditional-effects/conditions/builtin/viewer-roles.js | DONE | Name/description/placeholder localized |
| Condition localization | src/backend/effects/builtin/conditional-effects/conditions/condition-manager.js | old_jp_source/src/backend/effects/builtin/conditional-effects/conditions/condition-manager.js | DONE | Placeholder defaults and request log text localized |
| Effect localization | src/backend/effects/builtin/update-channel-reward.ts | old_jp_source/src/backend/effects/builtin/update-channel-reward.ts | DONE | Reward selection/settings/validation strings localized |
| Effect localization | src/backend/effects/builtin/update-counter.ts | old_jp_source/src/backend/effects/builtin/update-counter.ts | DONE | Counter UI/validation strings localized |
