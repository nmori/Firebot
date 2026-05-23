# JP Migration Progress Log

## Rules
- Update this file at the start and end of each phase.
- Record what was changed, what remains, and exact restart steps.
- Keep all work inside firebot folder. No git operations.

## 2026-04-05 Session
### Phase
- Phase 1 (GUI/i18n) started
- Phase 2 (time locale) partial started
- Phase 3 (compatibility labels) completed
- Phase 4 (JP-only features) completed

### Completed
- Added Japanese locale file: src/gui/app/lang/locale-ja.json (copied from old_jp_source baseline)
- Enabled Japanese preferred UI language with English fallback in src/gui/app/app-main.js
- Restored ja-JP date format handling in:
  - src/gui/app/directives/modals/misc/dateModal.js
  - src/gui/app/directives/modals/quotes/addOrEditQuoteModal.js
- Added legacy Japanese weekday normalization support in:
  - src/backend/restrictions/builtin/time-range.ts
- Generated locale key audit report:
  - jp_locale_key_audit.md
  - Result: Missing in ja = 0, Extra in ja = 67 (legacy-only keys)
- Migrated high-priority GUI template text:
  - src/gui/app/templates/live-events/_events.html
  - src/gui/app/templates/chat/_commands.html
- Added legacy comparison label compatibility normalization:
  - src/shared/filter-constants.js
  - src/backend/events/filters/filter-factory.ts
- Applied Japanese locale to overlay date/time widgets:
  - src/backend/overlay-widgets/builtin-types/current-date-time/current-date-time.ts
  - src/backend/overlay-widgets/builtin-types/countdown-to-date/countdown-to-date.ts
- Migrated remaining high-priority templates:
  - src/gui/app/templates/_roles-and-ranks.html
  - src/gui/app/templates/_timers.html
- Added first JP-only effect batch:
  - src/backend/effects/builtin/call-layna.js
  - src/backend/effects/builtin/send-vrchat.js
  - src/backend/effects/builtin/play-bouyomichan.js
  - registered in src/backend/effects/builtin-effect-loader.js
  - added EffectCategory.JP_ORIGINAL in src/shared/effect-constants.js
- Added second JP-only effect batch:
  - src/backend/effects/builtin/call-vtubestudio.js
  - src/backend/effects/builtin/onecomme-transfer.js
  - src/backend/effects/builtin/onecomme-wordparty.js
  - registered in src/backend/effects/builtin-effect-loader.js
  - normalized file line endings and validated with targeted error checks
- Added final JP-only effect batch (voice/translation group):
  - src/backend/effects/builtin/gpt-yncneo.js
  - src/backend/effects/builtin/play-yncneo.js
  - src/backend/effects/builtin/translate-yncneo.js
  - src/backend/effects/builtin/play-voicevox.js
  - src/backend/effects/builtin/play-voicevox-nemo.js
  - src/backend/effects/builtin/play-sharevox.js
  - src/backend/effects/builtin/play-itvoice.js
  - src/backend/effects/builtin/play-lmroid.js
  - src/backend/effects/builtin/play-coeiroink-v1.js
  - src/backend/effects/builtin/play-coeiroink-v2.js
  - registered in src/backend/effects/builtin-effect-loader.js
- Repaired transient encoding/line-ending breakage on JP effect files and revalidated.
- Final targeted validation on all JP-only effect files: no errors found.

### In Progress
- None

### Next Restart Steps
1. Launch Firebot and verify JP-only effect options render correctly in GUI.
2. Smoke test each JP-only integration endpoint (YNC NEO, VOICEVOX, COEIROINK, SHAREVOX, ITVoice, LMROID, onecomme, VTubeStudio).
3. If needed, perform follow-up TypeScript conversion in small batches without behavior changes.

### Blockers
- None
