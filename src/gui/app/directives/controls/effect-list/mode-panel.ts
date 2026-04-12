"use strict";
import type {
    FirebotComponent,
    EffectList
} from "../../../../../types";
import type { DropdownOption } from "../firebot-dropdown";
import type { PreviewItem } from "./effect-config-panel";

type Bindings = {
    effectsData: EffectList;
    onUpdate: () => void;
    disabled?: boolean;
};

type Controller = {
    options: DropdownOption[];
    previewItems: PreviewItem[];
    mainValue: PreviewItem;
};

(function () {
    const modePanel: FirebotComponent<Bindings, Controller> = {
        bindings: {
            effectsData: "<",
            onUpdate: "&",
            disabled: "<?"
        },
        template: `
            <effect-config-panel
                icon="fa-running"
                label="実行モード"
                tooltip="このリスト内のエフェクトを、トリガー時にどのように実行するかを決定します。"
                main-value="$ctrl.mainValue"
                preview-items="$ctrl.previewItems"
                disabled="$ctrl.disabled"
            >
                <div style="padding: 14px 0;">
                    <firebot-dropdown
                        ng-model="$ctrl.effectsData.runMode"
                        ng-change="$ctrl.onUpdate()"
                        options="$ctrl.options"
                        placeholder="実行モードを選択"
                        empty-message="利用可能な実行モードがありません"
                        option-toggling="false"
                        dark="true"
                    />
                </div>

                <div class="config-panel-control" ng-if="$ctrl.effectsData.runMode === 'random'">
                    <div class="config-control-label">
                        <i class="far fa-weight-hanging"></i>
                        <span>重み付き確率</span>
                        <tooltip text="'有効時は各エフェクトの重みに基づいて選択されます。無効時は同確率でランダムに選択されます。'"></tooltip>
                    </div>
                    <div>
                        <toggle-button
                            toggle-model="$ctrl.effectsData.weighted"
                            on-toggle="$ctrl.onUpdate()"
                            auto-update-value="true"
                            font-size="32"
                        ></toggle-button>
                    </div>
                </div>

                <div class="config-panel-control" ng-if="$ctrl.effectsData.runMode === 'random' && !$ctrl.effectsData.weighted">
                    <div class="config-control-label">
                        <i class="far fa-ban"></i>
                        <span>重複しない</span>
                        <tooltip text="'有効時は、すべてのエフェクトが1回ずつ使われるまで重複しません。'"></tooltip>
                    </div>
                    <div>
                        <toggle-button
                            toggle-model="$ctrl.effectsData.dontRepeatUntilAllUsed"
                            on-toggle="$ctrl.onUpdate()"
                            auto-update-value="true"
                            font-size="32"
                        ></toggle-button>
                    </div>
                </div>
            </effect-config-panel>
        `,
        controller: function (
            $scope: angular.IScope
        ) {
            const $ctrl = this;

            $ctrl.options = [
                {
                    name: "順番実行（すべて）",
                    value: "all",
                    icon: "fa-sort-numeric-down",
                    tooltip: "トリガー時に上から順にすべてのエフェクトを実行します。"
                },
                {
                    name: "順番実行（単体）",
                    value: "sequential",
                    icon: "fa-repeat-1",
                    tooltip: "トリガーごとに次の1件だけを実行します。すべて実行すると先頭から繰り返します。"
                },
                {
                    name: "ランダム実行（単体）",
                    value: "random",
                    icon: "fa-random",
                    tooltip: "トリガーごとにリストからランダムで1件を実行します。"
                }
            ];

            $ctrl.previewItems = [];

            function updatePreviewItems() {

                const runModeOption = $ctrl.options.find(opt => opt.value === $ctrl.effectsData?.runMode) ?? $ctrl.options[0];
                $ctrl.mainValue = {
                    icon: runModeOption.icon,
                    label: runModeOption.name,
                    tooltip: runModeOption.tooltip
                };

                const items: PreviewItem[] = [];

                if ($ctrl.effectsData?.runMode === "random") {
                    if ($ctrl.effectsData?.weighted) {
                        items.push({
                            icon: "fa-weight-hanging",
                            label: "重み付き",
                            tooltip: "重み付き確率を使用"
                        });
                    } else if ($ctrl.effectsData?.dontRepeatUntilAllUsed) {
                        items.push({
                            icon: "fa-ban",
                            label: "重複なし",
                            tooltip: "全件実行まで重複しません"
                        });
                    }
                }

                $ctrl.previewItems = items;
            }

            updatePreviewItems();

            $scope.$watchGroup(
                [
                    () => $ctrl.effectsData?.runMode,
                    () => $ctrl.effectsData?.weighted,
                    () => $ctrl.effectsData?.dontRepeatUntilAllUsed
                ],
                updatePreviewItems
            );
        }
    };

    // @ts-ignore
    angular.module("firebotApp").component("modePanel", modePanel);
})();
