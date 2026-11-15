import type { EffectType } from "../../../../types";

import overlayWidgetConfigManager from "../../../overlay-widgets/overlay-widget-config-manager";
import { LoggerCache } from "../../../logger-cache";
import { simpleClone } from "../../../utils";
import { ReplaceVariableManager } from "../../../variables/replace-variable-manager";
import type { RotatingTextWidgetConfig } from "../../../overlay-widgets/builtin-types/rotating-text/rotating-text";

const logger = LoggerCache.getLogger("Effects");

function removeTexts(
    currentTexts: string[],
    effect: {
        removeMode?: "first" | "last" | "position" | "matching";
        removePosition?: number;
        removeValue?: string;
        removeExactMatch?: boolean;
    }
): string[] {
    if (currentTexts.length === 0) {
        return currentTexts;
    }

    switch (effect.removeMode) {
        case "first":
            return currentTexts.slice(1);
        case "last":
            return currentTexts.slice(0, -1);
        case "position": {
            const position = effect.removePosition;
            if (position == null || position < 1 || position > currentTexts.length) {
                // Out of range, do nothing
                return currentTexts;
            }
            const result = [...currentTexts];
            result.splice(position - 1, 1);
            return result;
        }
        case "matching": {
            const target = (effect.removeValue ?? "").trim();
            if (target.length === 0) {
                return currentTexts;
            }
            if (effect.removeExactMatch) {
                return currentTexts.filter(text => text !== target);
            }
            const needle = target.toLowerCase();
            return currentTexts.filter(text => !text.toLowerCase().includes(needle));
        }
        default:
            return currentTexts;
    }
}

const model: EffectType<{
    rotatingTextWidgetId: string;
    action: "add" | "remove" | "set";
    // The list of texts, used by the "add" and "set" actions.
    texts?: string[];
    // Whether $variables in the texts are evaluated now or left raw for the widget to evaluate live.
    variableEvaluation?: "dynamic" | "onRun";
    // How the "remove" action decides which text to remove.
    removeMode?: "first" | "last" | "position" | "matching";
    // The position to remove (1-based), used when removeMode is "position".
    removePosition?: number;
    // The text to match against, used when removeMode is "matching".
    removeValue?: string;
    // When true, "matching" only removes exact matches instead of any text that contains the value.
    removeExactMatch?: boolean;
}> = {
    definition: {
        id: "firebot:update-rotating-text",
        name: "ローテーションテキスト更新",
        description: "ローテーションテキストのオーバーレイウィジェットに表示するテキストを追加・削除・置き換えします。",
        icon: "fad fa-text",
        categories: ["overlay", "advanced"],
        dependencies: [],
        keysExemptFromAutoVariableReplacement: ['texts']
    },
    optionsTemplate: `
        <eos-container ng-hide="hasRotatingTextWidgets">
            <p>この演出を使うにはローテーションテキストのオーバーレイウィジェットを作成する必要があります。<b>オーバーレイウィジェット</b>タブから作成してください。</p>
        </eos-container>
        <div ng-show="hasRotatingTextWidgets">
            <eos-container header="ローテーションテキストウィジェット">
                <firebot-overlay-widget-select
                    overlay-widget-types="['firebot:rotating-text']"
                    ng-model="effect.rotatingTextWidgetId"
                />
            </eos-container>

            <div ng-show="effect.rotatingTextWidgetId">
                <eos-container header="操作" pad-top="true">
                    <firebot-radio-cards
                        options="actions"
                        ng-model="effect.action"
                        grid-columns="3"
                    ></firebot-radio-cards>
                </eos-container>

                <div ng-show="effect.action === 'add' || effect.action === 'set'">
                    <eos-container header="{{ valueHeader() }}" pad-top="true">
                        <editable-list settings="textListSettings" model="effect.texts" />
                        <p class="muted" style="margin-top: 5px">各項目が 1 つのローテーションテキストになります。変数が使えます。</p>
                    </eos-container>

                    <eos-container header="変数の評価" pad-top="true">
                        <firebot-radios
                            options="variableEvaluationOptions"
                            model="effect.variableEvaluation"
                        />
                    </eos-container>
                </div>

                <div ng-show="effect.action === 'remove'">
                    <eos-container header="削除対象" pad-top="true">
                        <firebot-radio-cards
                            options="removeModes"
                            ng-model="effect.removeMode"
                            grid-columns="2"
                        ></firebot-radio-cards>
                    </eos-container>

                    <eos-container header="位置" pad-top="true" ng-show="effect.removeMode === 'position'">
                        <firebot-input
                            model="effect.removePosition"
                            input-type="number"
                            placeholder-text="位置を入力"
                        />
                        <p class="muted" style="margin-top: 5px">1 なら最初のテキスト、2 なら 2 番目のテキストが削除されます。位置がリストの末尾を超えている場合は何もしません。</p>
                    </eos-container>

                    <eos-container header="一致させるテキスト" pad-top="true" ng-show="effect.removeMode === 'matching'">
                        <firebot-input
                            model="effect.removeValue"
                            use-text-area="true"
                            placeholder-text="一致させるテキストを入力"
                        />
                        <p class="muted" style="margin-top: 5px">既定では、この値を<b>含む</b>ローテーションテキストがすべて削除されます（大文字・小文字は区別しません）。</p>
                        <firebot-checkbox
                            model="effect.removeExactMatch"
                            label="完全一致のみ削除する"
                            style="margin-top: 10px"
                        />
                    </eos-container>
                </div>
            </div>
        </div>
    `,
    optionsController: ($scope, overlayWidgetsService) => {
        $scope.hasRotatingTextWidgets = overlayWidgetsService.hasOverlayWidgetConfigsOfType("firebot:rotating-text");

        $scope.actions = [
            {
                value: "add",
                label: "追加",
                iconClass: "fa-plus"
            },
            {
                value: "remove",
                label: "削除",
                iconClass: "fa-minus"
            },
            {
                value: "set",
                label: "設定（上書き）",
                iconClass: "fa-equals"
            }
        ];

        $scope.removeModes = [
            {
                value: "first",
                label: "最初のテキスト",
                iconClass: "fa-arrow-to-top"
            },
            {
                value: "last",
                label: "最後のテキスト",
                iconClass: "fa-arrow-to-bottom"
            },
            {
                value: "position",
                label: "指定位置",
                iconClass: "fa-list-ol"
            },
            {
                value: "matching",
                label: "一致するテキスト",
                iconClass: "fa-search"
            }
        ];

        $scope.textListSettings = {
            sortable: true,
            useTextArea: true,
            addLabel: "テキストを追加",
            editLabel: "テキストを編集",
            noneAddedText: "テキストはまだ追加されていません",
            trigger: $scope.trigger,
            triggerMeta: $scope.triggerMeta
        };

        $scope.variableEvaluationOptions = {
            dynamic: {
                text: "オーバーレイ上でその都度評価する",
                description: "各テキストを $変数 を含んだまま保存します。テキストが表示に切り替わるたびにオーバーレイウィジェットが変数を再評価するため、$randomNumber などの値はローテーションごとに更新されます。"
            },
            onRun: {
                text: "この演出の実行時に評価する",
                description: "この演出の実行時点で $変数 を現在の値に置き換え、その結果のテキストを保存します。オーバーレイでは毎回同じ固定テキストが表示されます。"
            }
        };

        $scope.effect.variableEvaluation = $scope.effect.variableEvaluation ?? "dynamic";

        $scope.valueHeader = () => {
            return $scope.effect.action === "set" ? "新しいテキスト一覧" : "追加するテキスト";
        };
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.rotatingTextWidgetId == null) {
            errors.push("ローテーションテキストウィジェットを選択してください。");
            return errors;
        }
        if (effect.action == null) {
            errors.push("実行する操作を選択してください。");
            return errors;
        }

        if (effect.action === "add" || effect.action === "set") {
            if (effect.texts == null || effect.texts.length === 0) {
                errors.push("テキストを 1 つ以上追加してください。");
            }
        } else if (effect.action === "remove") {
            if (effect.removeMode == null) {
                errors.push("削除対象を選択してください。");
            } else if (effect.removeMode === "position" && (effect.removePosition == null || effect.removePosition < 1)) {
                errors.push("1 以上の位置を入力してください。");
            } else if (effect.removeMode === "matching" && (effect.removeValue == null || effect.removeValue.trim().length === 0)) {
                errors.push("一致させるテキストを入力してください。");
            }
        }

        return errors;
    },
    getDefaultLabel: (effect, overlayWidgetsService) => {
        const widgetName = overlayWidgetsService.getOverlayWidgetConfig(effect.rotatingTextWidgetId)?.name ?? "不明なウィジェット";
        switch (effect.action) {
            case "remove":
                switch (effect.removeMode) {
                    case "first":
                        return `${widgetName} の最初のテキストを削除`;
                    case "last":
                        return `${widgetName} の最後のテキストを削除`;
                    case "position":
                        return `${widgetName} の ${effect.removePosition ?? "?"} 番目のテキストを削除`;
                    case "matching":
                        return `${widgetName} の一致するテキストを削除`;
                    default:
                        return `${widgetName} のテキストを削除`;
                }
            case "set":
                return `${widgetName} のテキストを設定`;
            default:
                return `${widgetName} にテキストを追加`;
        }
    },
    onTriggerEvent: async (event) => {
        const { effect } = event;

        if (effect.rotatingTextWidgetId == null || effect.action == null) {
            return false;
        }

        const config = simpleClone(
            overlayWidgetConfigManager.getItem(effect.rotatingTextWidgetId)
        ) as RotatingTextWidgetConfig | null;

        if (!config) {
            logger.warn(`Failed to update Rotating Text ${effect.rotatingTextWidgetId} because it does not exist.`);
            return false;
        }

        const currentTexts = config.settings?.texts ?? [];
        let newTexts: string[];

        if (effect.action === "add" || effect.action === "set") {
            let texts = (effect.texts ?? [])
                .map(text => text?.trim() ?? "")
                .filter(text => text.length > 0);

            if (effect.variableEvaluation === "onRun") {
                texts = (await Promise.all(
                    texts.map(text => ReplaceVariableManager.populateStringWithTriggerData(text, {
                        ...event.trigger,
                        effectOutputs: event.outputs
                    }))
                ))
                    .map(text => text.trim())
                    .filter(text => text.length > 0);
            }

            if (effect.action === "add") {
                if (texts.length === 0) {
                    // Nothing to add.
                    return true;
                }
                newTexts = [...currentTexts, ...texts];
            } else {
                newTexts = texts;
            }
        } else if (effect.action === "remove") {
            newTexts = removeTexts(currentTexts, effect);
        } else {
            return false;
        }

        config.settings = {
            ...config.settings,
            texts: newTexts
        };

        overlayWidgetConfigManager.saveWidgetConfig(config);

        return true;
    }
};

export = model;
