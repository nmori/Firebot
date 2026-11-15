"use strict";

(function() {
    angular.module("firebotApp")
        .component("contextMenuModalHeader", {
            bindings: {
                triggerType: "@",
                triggerName: "<",
                sortTags: "=",
                onClose: "&",
                showTriggerName: "<"
            },
            template: `
            <scroll-sentinel element-class="context-menu-modal-header"></scroll-sentinel>
            <div class="modal-header context-menu-modal-header sticky-header">
                <button
                    type="button"
                    class="close"
                    aria-label="閉じる"
                    ng-click="$ctrl.onClose()"
                >
                    <i class="fal fa-times" aria-hidden="true"></i>
                </button>
                <div class="context-menu mr-10">
                    <span ng-show="$ctrl.allSortTags.length > 0"
                        class="noselect clickable flex"
                        context-menu="$ctrl.getContextMenu()"
                        context-menu-on="click"
                        context-menu-orientation="left"
                    >
                        <i class="fal fa-ellipsis-v"></i>
                    </span>
                </div>
                <h4 class="modal-title">
                    <div class="action text-4xl">{{$ctrl.getTriggerTypeDisplayName()}}{{$ctrl.triggerName ? 'の編集' : 'の新規追加'}}<span ng-if="$ctrl.triggerName">:</span></div>
                    <div class="text-4xl font-semibold" ng-if="$ctrl.triggerName && $ctrl.showTriggerName">{{$ctrl.triggerName}}</div>
                </h4>
            </div>

            `,
            controller: function (sortTagsService) {
                const $ctrl = this;

                $ctrl.$onInit = () => {
                    $ctrl.sortTagContext = `${$ctrl.triggerType}s`;
                    $ctrl.allSortTags = sortTagsService.getSortTags($ctrl.sortTagContext);
                };

                // triggerType はタグの保存キー（`${triggerType}s`）にも使われるため値は英語のまま、表示だけ日本語化する
                const triggerTypeDisplayNames = {
                    "command": "コマンド",
                    "counter": "カウンター",
                    "effect queue": "演出キュー",
                    "event": "イベント",
                    "preset effect list": "プリセット演出リスト",
                    "scheduled effect list": "演出予定リスト",
                    "timer": "タイマー"
                };
                $ctrl.getTriggerTypeDisplayName = () => triggerTypeDisplayNames[$ctrl.triggerType] ?? $ctrl.triggerType;

                $ctrl.getContextMenu = () => {
                    const menuItems = [];

                    if ($ctrl.sortTagContext != null) {
                        if ($ctrl.allSortTags.length > 0) {
                            menuItems.push({
                                text: "タグ...",
                                childrenMenuClass: "sort-tag-menu",
                                children: $ctrl.allSortTags.map((st) => {
                                    const isSelected = $ctrl.sortTags && $ctrl.sortTags.includes(st.id);
                                    return {
                                        html: `<a href class="sort-tag-item"><i class="${isSelected ? 'fas fa-check' : ''}" style="margin-right: ${isSelected ? '10' : '27'}px;"></i> ${st.name}</a>`,
                                        click: () => {
                                            $ctrl.toggleSortTag(st.id);
                                        }
                                    };
                                }),
                                hasTopDivider: false
                            });
                        }
                    }

                    return menuItems;
                };

                $ctrl.toggleSortTag = (tagId) => {
                    if ($ctrl.sortTags.includes(tagId)) {
                        $ctrl.sortTags = $ctrl.sortTags.filter(id => id !== tagId);
                    } else {
                        $ctrl.sortTags.push(tagId);
                    }
                };
            }
        });
}());
