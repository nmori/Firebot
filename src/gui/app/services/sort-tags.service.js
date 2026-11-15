"use strict";

/** @import { SortTag } from "../../../types" */

(function() {

    angular
        .module("firebotApp")
        .factory("sortTagsService", function(utilityService, backendCommunicator) {
            const service = {};

            /**
             * @type {Record<string, SortTag[]>}
             */
            let sortTags = {};

            /**
             * @type {Record<string, SortTag>}
             */
            const selectedSortTags = {};

            /**
             * タグのコンテキスト（保存キー）を表示名に変換する。キー自体は保存データと
             * 本家との互換のため英語のまま使い、表示だけを日本語にする。
             * @type {Record<string, string>}
             */
            const contextDisplayNames = {
                "channel rewards": "チャンネル報酬",
                "commands": "コマンド",
                "counters": "カウンター",
                "effect queues": "演出キュー",
                "events": "イベント",
                "hotkeys": "ホットキー",
                "overlay widgets": "オーバーレイウィジェット",
                "power ups": "パワーアップ",
                "preset effect lists": "プリセット演出リスト",
                "rank ladders": "ランク",
                "scheduled effect lists": "演出予定リスト",
                "timers": "タイマー",
                "variable macros": "変数マクロ"
            };

            /**
             * @param {string} context
             * @returns {string}
             */
            service.getContextDisplayName = context => contextDisplayNames[context] ?? context;

            /**
             * 旧 JP 版では演出予定リスト一覧のタグを "演出予定リスト" というキーで保存していた
             * （編集モーダル側は "scheduled effect lists" を使っていたため食い違っていた）。
             * 新キー側が空のときだけ旧キーのタグを引き継ぐ。タグ ID はそのままなので項目の紐付けも維持される。
             */
            const LEGACY_SCHEDULED_CONTEXT = "演出予定リスト";
            const SCHEDULED_CONTEXT = "scheduled effect lists";
            function migrateLegacyScheduledSortTags() {
                const legacyTags = sortTags[LEGACY_SCHEDULED_CONTEXT];
                if (!Array.isArray(legacyTags) || legacyTags.length === 0) {
                    return;
                }
                const currentTags = sortTags[SCHEDULED_CONTEXT];
                if (Array.isArray(currentTags) && currentTags.length > 0) {
                    return;
                }
                backendCommunicator.send("sort-tags:save-sort-tags", {
                    context: SCHEDULED_CONTEXT,
                    sortTags: legacyTags
                });
                backendCommunicator.send("sort-tags:save-sort-tags", {
                    context: LEGACY_SCHEDULED_CONTEXT,
                    sortTags: []
                });
            }

            /**
             * @param {string} context
             * @returns {SortTag[]}
             */
            service.getSortTags = (context) => {
                if (sortTags[context] == null) {
                    sortTags[context] = [];
                }
                return sortTags[context];
            };

            /**
             * @param {string} context
             * @param {string[]} tagIds
             * @returns {SortTag[]}
             */
            service.getSortTagsForItem = (context, tagIds) => {
                if (context == null || tagIds == null) {
                    return [];
                }
                return service.getSortTags(context)
                    .filter(st => tagIds.includes(st.id));
            };

            /**
             * @param {string} context
             */
            service.showEditSortTagsModal = (context) => {
                const sortTagsForContext = service.getSortTags(context);
                utilityService.showModal({
                    component: "manageSortTagsModal",
                    size: "sm",
                    resolveObj: {
                        tags: () => sortTagsForContext
                    },
                    closeCallback: (tags) => {
                        backendCommunicator.send("sort-tags:save-sort-tags", {
                            context,
                            sortTags: tags
                        });
                    }
                });
            };

            /** @param {string} context */
            service.getSelectedSortTag = context => selectedSortTags[context];

            /** @param {string} context */
            service.getSelectedSortTagDisplay = context => (
                selectedSortTags[context] != null
                    ? selectedSortTags[context].name
                    : `すべての${service.getContextDisplayName(context)}`
            );

            /**
             * @param {string} context
             * @param {SortTag} tag
             */
            service.setSelectedSortTag = (context, tag) => {
                selectedSortTags[context] = tag;
            };

            backendCommunicator.on("sort-tags:updated-sort-tags", (updatedSortTags) => {
                sortTags = updatedSortTags;
                migrateLegacyScheduledSortTags();
            });

            backendCommunicator.send("sort-tags:ui-service-ready");

            return service;
        });
}());