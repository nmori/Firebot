import { EffectType } from "../../../../types/effects";
import overlayWidgetConfigManager from "../../../overlay-widgets/overlay-widget-config-manager";
import logger from "../../../logwrapper";

const model: EffectType<{
    progressBarWidgetId: string;
    action: "increment" | "set";
    value: string;
}> = {
    definition: {
        id: "firebot:update-progress-bar",
        name: "プログレスバー更新",
        description: "プログレスバーの値を更新します。",
        icon: "fad fa-percentage",
        categories: ["overlay", "advanced"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container ng-hide="hasProgressBarWidgets">
            <p>このエフェクトを使うにはプログレスバーのオーバーレイウィジェットを作成する必要があります。<b>オーバーレイウィジェット</b>タブから作成してください。</p>
        </eos-container>
        <div ng-show="hasProgressBarWidgets">
            <eos-container header="プログレスバー">
                <firebot-overlay-widget-select
                    overlay-widget-types="['firebot:progressbar']"
                    ng-model="effect.progressBarWidgetId"
                />
            </eos-container>

            <div ng-show="effect.progressBarWidgetId">
                <eos-container header="操作" pad-top="true">
                    <firebot-radio-cards
                        options="actions"
                        ng-model="effect.action"
                        grid-columns="2"
                    ></firebot-radio-cards>
                </eos-container>
            </div>

            <eos-container header="{{effect.action == 'increment' ? '増減量' : '新しい値'}}" pad-top="true" ng-show="effect.action">
                <firebot-input
                    input-title="値"
                    model="effect.value"
                    placeholder-text="値を入力"
                    data-type="number"
                />
            </eos-container>
        </div>
    `,
    optionsController: ($scope, overlayWidgetsService) => {

        $scope.hasProgressBarWidgets = overlayWidgetsService.hasOverlayWidgetConfigsOfType("firebot:progressbar");

        $scope.actions = [
            {
                value: "increment",
                label: "増減",
                iconClass: "fa-plus",
                description: "プログレスバーを指定値だけ増やします（負数で減らせます）"
            },
            {
                value: "set",
                label: "設定",
                iconClass: "fa-equals",
                description: "プログレスバーを新しい値に設定します。"
            }
        ];
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.progressBarWidgetId == null) {
            errors.push("プログレスバーを選択してください。");
        } else if (effect.action == null) {
            errors.push("更新操作を選択してください。");
        } else if (effect.value === undefined || effect.value === "") {
            errors.push("更新値を入力してください。");
        }

        return errors;
    },
    getDefaultLabel: (effect, overlayWidgetsService) => {
        const progressBarName = overlayWidgetsService.getOverlayWidgetConfig(effect.progressBarWidgetId)?.name ?? "不明なプログレスバー";
        return effect.action === "increment"
            ? `${progressBarName} を ${effect.value} 増減`
            : `${progressBarName} を ${effect.value} に設定`;
    },
    onTriggerEvent: (event) => {
        const { effect } = event;

        if (effect.progressBarWidgetId == null || effect.action == null || effect.value == null) {
            return false;
        }

        const value = parseInt(effect.value);

        if (isNaN(value)) {
            logger.warn(`Failed to update Progress Bar ${effect.progressBarWidgetId} because ${effect.value} is not a number.`);
            return false;
        }

        const progressBarWidget = overlayWidgetConfigManager.getItem(effect.progressBarWidgetId);
        if (!progressBarWidget) {
            logger.warn(`Failed to update Progress Bar ${effect.progressBarWidgetId} because it does not exist.`);
            return false;
        }

        const currentValue = progressBarWidget.state?.currentValue as number ?? 0;

        overlayWidgetConfigManager.setWidgetStateById(effect.progressBarWidgetId, {
            ...progressBarWidget.state,
            currentValue: effect.action === "increment" ? currentValue + value : value
        });

        return true;
    }
};

export = model;