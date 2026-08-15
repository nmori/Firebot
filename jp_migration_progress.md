# JP Migration Progress Log

## Rules
- Update this file at the start and end of each phase.
- Record what was changed, what remains, and exact restart steps.
- Keep all work inside firebot folder. No git operations.

## 2026-08-15 Session

### Phase
- Phase 5 (非推奨エフェクトの移行支援) completed
- Phase 6 (残存英語UIの掃き出し) completed

### Completed
- 非推奨エフェクトに「エフェクトリスト実行」への変換ボタンを追加
  - src/gui/app/services/effect-helper.service.js
    - `service.convertDeprecatedListEffect(effect, runMode)` を新設
    - 元オブジェクトは非破壊。`JSON.parse(angular.toJson(effect))` のクローン上で組み立てる
    - `firebot:randomeffect` / `firebot:sequentialeffect` → `firebot:run-effect-list`
      (`listType: "custom"`, `effectList.runMode` = random / sequential)
    - `effectList.id` を必ず維持（effect-run-mode-handler.ts の
      sequentialCache / randomCache のキーのため。失うと順次位置やシャッフルキューが消える）
    - EffectInstance 共通プロパティ(id/active/effectLabel/effectComment/
      abortTimeout/percentWeight/async/outputNames)を引き継ぐ
    - `weighted` → `effectList.weighted`、`dontRepeat` → `effectList.dontRepeatUntilAllUsed`
    - デッドフィールドの `effect.outputs` は破棄
    - 差し替え前後で8項目を検証し、全通過時のみ success を返す
      (件数の往復チェック、effectList.id 一致、runMode 設定確認 ほか)
  - src/gui/app/services/modal-factory.service.js
    - `$scope.$on("effectOptions.replaceEffect", ...)` を追加
    - エフェクトオプションの分離スコープから $emit で差し替えを依頼する経路
    - 差し替えはモーダル側のみが行い、`effectTypeUpdated()` でヘッダ/パンくずも更新
  - src/backend/effects/builtin/deprecated/random-effect.ts
  - src/backend/effects/builtin/deprecated/sequential-effect.ts
    - 警告バナー内に「「エフェクトリスト実行」に変換」ボタンを追加
    - optionsController に確認ダイアログ → 検証 → $emit → トーストの流れを実装
    - `showConfirmationModal` はネイティブ Promise を返すため continuation を
      `$timeout` で包んでダイジェストに載せている（省くと再描画されない）
    - random-effect 側に不足していた `effectList` の null 初期化を追加
    - sequential の警告文を mode-panel の実ラベル「順番実行（単体）」に統一
- 未翻訳UIの日本語化
  - src/gui/app/directives/controls/effect-list/effect-list.ts
    - DEPRECATED バッジの uib-tooltip / aria-label を翻訳
    - バッジ本文の英字は ASYNC バッジの慣例に合わせて据え置き
  - src/gui/app/services/modal-factory.service.js
    - エフェクト編集モーダルのオーバーフローメニュー、各トースト、
      ラベル追加/編集、Select New Effect、Replace Variable Error ほか
  - GUI 全体の残存英語（約30ファイル）
    - 設定画面(general/backups/dashboard/tts)の aria-label
    - 各コントローラのテーブル列見出し（表示専用。dataField が実キー）
    - 各サービスのトースト、breadcrumbName、ファイルダイアログのフィルタ名
    - animation.service.js のアニメーション表示名 103 件と category
      （`class` は animate.css の識別子のため非変更）
  - src/backend/effects/builtin/show-text.ts（name/description/optionsTemplate 一式）
  - src/backend/effects/builtin/deprecated/show-text.js
    - 新エフェクトと名前が衝突するため「テキスト表示（旧版）」に改名
    - 閉じられていない重複 `<eos-container header="Text">` を除去（マージ残骸の修正）
  - src/backend/variables/builtin/** の description 70 行 / 33 ファイル
    - `usage:` は変数の呼び出し構文のため一切変更していない

### 意図的に翻訳しなかったもの
- src/gui/app/services/sound.service.js の `notificationSoundOptions[].name`
  → 設定に永続化されるキー。`=== "None"` / `=== "Custom"` の比較と
    `.find(n => n.name === ...)` に使われるため、翻訳すると既存設定が壊れる
- src/gui/app/directives/chat/feed items/chat-message.js の action `name`
  → 内部キー。表示は `getActionLabel()` で既に日本語化済み
- account-access.service.js / connection.service.js の `username` 既定値
  → 表示ラベルではなくデータ項目のため据え置き
- firebot-audio-output-device-select.js の `{ name: "divider" }` → 内部マーカー
- 変数の `usage:` 全般、`moderator-ban.ts` の `name: "BAN"`、各種製品名

### In Progress
- None

### Next Restart Steps
1. `npm start` で起動し、非推奨エフェクト（ランダム/順次）を開いて変換ボタンを確認
2. 重み付き ON / 繰り返し防止 ON / 空リスト の各パターンで変換を検証
3. 変換後に「エフェクト JSON をコピー」で `effectList.id` が維持されているか確認
4. 変換してキャンセル → 元データが残ること、保存 → 反映されることを確認
5. 変数一覧で翻訳済み説明文と `usage` 構文の健全性を確認

### Blockers
- None

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
