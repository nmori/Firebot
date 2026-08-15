"use strict";
(function() {
    // This provides helper methods for control effects

    const { randomUUID } = require("crypto");

    angular
        .module("firebotApp")
        .factory("effectHelperService", function(backendCommunicator) {
            const service = {};

            const mapEffectDef = function(effectDef) {
                return {
                    definition: effectDef.definition,
                    optionsTemplate: effectDef.optionsTemplate,
                    optionsTemplateUrl: effectDef.optionsTemplateUrl,
                    optionsController: eval(effectDef.optionsControllerRaw), // eslint-disable-line no-eval
                    optionsValidator: eval(effectDef.optionsValidatorRaw), // eslint-disable-line no-eval
                    getDefaultLabel: effectDef.getDefaultLabelRaw ? eval(effectDef.getDefaultLabelRaw) : undefined // eslint-disable-line no-eval
                };
            };

            service.getEffectDefinition = function(id) {
                if (id == null) {
                    return null;
                }

                const effectDef = backendCommunicator.fireEventSync("getEffectDefinition", id);

                if (effectDef == null) {
                    return null;
                }

                return mapEffectDef(effectDef);
            };

            service.getAllEffectDefinitions = async function() {
                const effectDefs = (await backendCommunicator
                    .fireEventAsync("getAllEffectDefinitions")
                ).map(e => e.definition);

                return effectDefs;
            };

            service.getAllEffectTypes = async function() {
                const effectDefs = (await backendCommunicator
                    .fireEventAsync("getAllEffectDefinitions")
                ).map(mapEffectDef);

                return effectDefs;
            };

            // This is an object that will get passed into the scope of every effect type template
            // containing common options that appear in more than one effect
            service.commonOptionsForEffectTypes = {
                chatters: ["Streamer", "Bot"]
            };

            // This is used by effects that make use of lists of checkboxes. Returns and array of selected boxes.
            service.getCheckedBoxes = function(list, item) {
                let itemArray = list,
                    itemIndex;
                if (list == null || list instanceof Array === false) {
                    itemArray = [];
                }

                try {
                    itemIndex = itemArray.indexOf(item);
                } catch (err) {
                    itemIndex = -1;
                }

                if (itemIndex !== -1) {
                    // Item exists, so we're unchecking it.
                    itemArray.splice(itemIndex, 1);
                } else {
                    // Item doesn't exist! Add it in.
                    itemArray.push(item);
                }

                // Set new scope var.
                return itemArray;
            };

            // This is used to check for an item in a saved array and returns true if it exists.
            service.checkSavedArray = function(list, item) {
                if (list != null) {
                    return list.indexOf(item) !== -1;
                }
                return false;
            };

            const DEPRECATED_LIST_EFFECT_TYPES = ["firebot:randomeffect", "firebot:sequentialeffect"];

            /**
             * 非推奨の「ランダムエフェクト実行 / 順次エフェクト実行」を
             * 「エフェクトリスト実行」(firebot:run-effect-list) 形式へ変換します。
             *
             * 渡されたエフェクトは一切変更しません。全ての検証を通過した場合のみ
             * success: true と変換後のエフェクトを返します。
             *
             * @param {object} effect 変換元のエフェクト（非推奨エフェクト）
             * @param {"random"|"sequential"} runMode 変換後の実行モード
             * @returns {{ success: boolean, errors: string[], effect?: object }}
             */
            service.convertDeprecatedListEffect = function(effect, runMode) {
                const errors = [];

                if (effect == null) {
                    errors.push("エフェクトデータが見つかりませんでした。");
                    return { success: false, errors };
                }

                if (runMode !== "random" && runMode !== "sequential") {
                    errors.push(`未対応の実行モードです: ${runMode}`);
                    return { success: false, errors };
                }

                if (!DEPRECATED_LIST_EFFECT_TYPES.includes(effect.type)) {
                    errors.push("このエフェクトは変換対象ではありません。");
                    return { success: false, errors };
                }

                if (effect.id == null) {
                    errors.push("エフェクト ID を引き継げませんでした。");
                    return { success: false, errors };
                }

                const sourceList = effect.effectList;

                // 配列やスカラーで保存されている壊れた古いデータは黙って変換しない
                if (sourceList != null && (typeof sourceList !== "object" || Array.isArray(sourceList))) {
                    errors.push("エフェクトリストの形式が不正なため変換できません。");
                    return { success: false, errors };
                }

                if (sourceList != null && sourceList.list != null && !Array.isArray(sourceList.list)) {
                    errors.push("エフェクトリストの形式が不正なため変換できません。");
                    return { success: false, errors };
                }

                // 往復検証に使うため、クローン前のライブオブジェクトから件数を取得する
                const originalCount = sourceList?.list?.length ?? 0;
                const originalListId = sourceList?.id;

                // 元データを壊さないようディープコピー上で組み立てる
                // ($$hashKey などの Angular 内部プロパティは angular.toJson が除去する)
                let source;
                try {
                    source = JSON.parse(angular.toJson(effect));
                } catch {
                    errors.push("エフェクトデータを複製できませんでした。");
                    return { success: false, errors };
                }

                const clonedList = source.effectList ?? {};

                const newEffectList = {
                    // キュー設定など未知のプロパティも引き継ぐ
                    ...clonedList,
                    // 実行順・シャッフルキャッシュのキーになるため id は必ず維持する
                    id: clonedList.id ?? randomUUID(),
                    list: clonedList.list ?? [],
                    runMode: runMode
                };

                if (runMode === "random") {
                    newEffectList.weighted = source.weighted === true || clonedList.weighted === true;
                    newEffectList.dontRepeatUntilAllUsed = newEffectList.weighted
                        ? false
                        : (source.dontRepeat === true || clonedList.dontRepeatUntilAllUsed === true);
                }

                const converted = {
                    // --- エフェクト共通プロパティ（親リストでの扱いを壊さないため必ず引き継ぐ） ---
                    id: source.id,
                    type: "firebot:run-effect-list",
                    active: source.active !== false,
                    effectLabel: source.effectLabel ?? null,
                    effectComment: source.effectComment ?? null,
                    abortTimeout: source.abortTimeout ?? null,
                    percentWeight: source.percentWeight ?? null,
                    async: source.async === true,

                    // --- 「エフェクトリスト実行」固有 ---
                    listType: "custom",
                    effectList: newEffectList,
                    presetListId: null,
                    presetListArgs: {},
                    // 非推奨エフェクトは常に完了を待っていた
                    dontWait: false,
                    // 旧「順次エフェクト実行」は outputs を親に渡さないため false になる
                    bubbleOutputs: source.bubbleOutputs === true
                };

                if (source.outputNames != null) {
                    converted.outputNames = source.outputNames;
                }

                // --- 差し替え前の最終検証 ---
                if (converted.effectList.id == null) {
                    errors.push("エフェクトリスト ID を引き継げませんでした。");
                }

                if (originalListId != null && converted.effectList.id !== originalListId) {
                    errors.push("エフェクトリスト ID が一致しません。");
                }

                if (converted.effectList.list.length !== originalCount) {
                    errors.push(`エフェクトの件数が一致しません (${originalCount} → ${converted.effectList.list.length})。`);
                }

                if (converted.effectList.runMode !== runMode) {
                    errors.push("実行モードを設定できませんでした。");
                }

                if (errors.length > 0) {
                    return { success: false, errors };
                }

                return { success: true, errors: [], effect: converted };
            };

            return service;
        });
}());
