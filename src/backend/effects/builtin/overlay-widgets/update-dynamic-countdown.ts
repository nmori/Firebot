import { EffectType } from "../../../../types/effects";
import overlayWidgetConfigManager from "../../../overlay-widgets/overlay-widget-config-manager";
import logger from "../../../logwrapper";
import type { DynamicCountdownWidgetConfig } from "../../../overlay-widgets/builtin-types/countdown/countdown-dynamic";
import countdownManager from "../../../overlay-widgets/builtin-types/countdown/countdown-manager";

const model: EffectType<{
    countdownWidgetId: string;
    action: "add" | "subtract" | "set" | "change-mode";
    mode?: "running" | "paused" | "toggle";
    value?: string;
    startIfPaused?: boolean;
}> = {
    definition: {
        id: "firebot:update-dynamic-countdown",
        name: "カウントダウン更新（動的）",
        description: "動的カウントダウンタイマーの残り時間を更新します。",
        icon: "fad fa-hourglass-half",
        categories: ["overlay", "advanced"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container ng-hide="hasCountdownWidgets">
            <p>このエフェクトを使うには Countdown（Dynamic）のオーバーレイウィジェットを作成する必要があります。<b>オーバーレイウィジェット</b>タブから作成してください。</p>
        </eos-container>
        <div ng-show="hasCountdownWidgets">
            <eos-container header="カウントダウン">
                <firebot-overlay-widget-select
                    overlay-widget-types="['firebot:countdown-dynamic']"
                    ng-model="effect.countdownWidgetId"
                />
            </eos-container>

            <div ng-show="effect.countdownWidgetId">

                <eos-container header="操作" pad-top="true">
                    <firebot-radio-cards
                        options="actions"
                        ng-model="effect.action"
                        grid-columns="2"
                    ></firebot-radio-cards>
                </eos-container>

                <eos-container header="モード" pad-top="true" ng-if="effect.action == 'change-mode'">
                    <firebot-radio-cards
                        options="modes"
                        ng-model="effect.mode"
                        grid-columns="3"
                    ></firebot-radio-cards>
                </eos-container>

                <eos-container header="{{effect.action === 'set' ? '新しい値' : '値'}}" pad-top="true" ng-show="effect.action && effect.action !== 'change-mode'">
                    <firebot-input
                        model="effect.value"
                        input-title="秒数"
                        data-type="number"
                        placeholder-text="秒数を入力"
                    />

                    <firebot-checkbox
                        style="margin-top: 10px"
                        model="effect.startIfPaused"
                        label="一時停止中でも開始する"
                        tooltip="現在一時停止中の場合にカウントダウンを開始するかどうかを設定します。"
                    />
                </eos-container>
            </div>
        </div>
    `,
    optionsController: ($scope, overlayWidgetsService) => {
        $scope.hasCountdownWidgets = overlayWidgetsService.hasOverlayWidgetConfigsOfType("firebot:countdown-dynamic");

        $scope.actions = [
            {
                value: "add",
                label: "時間を追加",
                iconClass: "fa-plus"
            },
            {
                value: "subtract",
                label: "時間を減らす",
                iconClass: "fa-minus"
            },
            {
                value: "set",
                label: "時間を設定",
                iconClass: "fa-equals"
            },
            {
                value: "change-mode",
                label: "モード変更",
                iconClass: "fa-exchange"
            }
        ];

        $scope.modes = [
            {
                value: "toggle",
                label: "切り替え",
                iconClass: "fa-exchange"
            },
            {
                value: "running",
                label: "開始/再開",
                iconClass: "fa-play"
            },
            {
                value: "paused",
                label: "一時停止",
                iconClass: "fa-pause"
            }
        ];
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.countdownWidgetId == null) {
            errors.push("カウントダウンウィジェットを選択してください。");
        } else if (effect.action == null) {
            errors.push("操作を選択してください。");
        } else if (effect.action === "change-mode" && effect.mode == null) {
            errors.push("変更するモードを選択してください。");
        } else if (effect.action !== "change-mode" && effect.value == null) {
            errors.push("値を入力してください。");
        }

        return errors;
    },
    getDefaultLabel: (effect, overlayWidgetsService) => {
        const countdownName = overlayWidgetsService.getOverlayWidgetConfig(effect.countdownWidgetId)?.name ?? "不明なカウントダウン";
        const actionMap: Record<string, string> = {
            add: "に加算",
            subtract: "から減算",
            set: "を設定",
            "change-mode": "のモードを変更"
        };
        const verb = actionMap[effect.action] ?? effect.action;
        if (effect.action === "change-mode") {
            return `${countdownName} ${verb}`;
        }
        return `${countdownName} ${verb} ${effect.value}`;
    },
    onTriggerEvent: (event) => {
        const { effect } = event;

        if (effect.countdownWidgetId == null || effect.action == null) {
            return false;
        }

        const countdownWidget = overlayWidgetConfigManager.getItem(effect.countdownWidgetId) as DynamicCountdownWidgetConfig | null;
        if (!countdownWidget) {
            logger.warn(`Failed to update Countdown ${effect.countdownWidgetId} because it does not exist.`);
            return false;
        }

        if (effect.action === "change-mode") {
            if (effect.mode == null) {
                logger.warn(`Failed to change Countdown ${effect.countdownWidgetId} mode because no mode was specified.`);
                return false;
            }

            let newMode: "running" | "paused";
            if (effect.mode === "toggle") {
                newMode = countdownWidget.state?.mode === "running" ? "paused" : "running";
            } else {
                newMode = effect.mode === "running" ? "running" : "paused";
            }

            const newState: DynamicCountdownWidgetConfig["state"] = {
                ...countdownWidget.state,
                mode: newMode
            };

            overlayWidgetConfigManager.setWidgetStateById(effect.countdownWidgetId, newState);
        } else {
            if (effect.value == null) {
                logger.warn(`Failed to update Countdown ${effect.countdownWidgetId} because no value was specified.`);
                return false;
            }

            const value = parseInt(effect.value);

            if (isNaN(value)) {
                logger.warn(`Failed to update Countdown ${effect.countdownWidgetId} because ${effect.value} is not a number.`);
                return false;
            }

            countdownManager.updateCountdownTime(effect.countdownWidgetId, effect.action, value, false, effect.startIfPaused);
        }

        return true;
    }
};

export = model;