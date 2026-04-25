import { EffectType } from "../../../types/effects";
import { OverlayWidgetConfig } from "../../../types/overlay-widgets";
import overlayWidgetConfigManager from "../../overlay-widgets/overlay-widget-config-manager";

const effect: EffectType<{
    mode: "toggle" | "disable" | "enable";
    widgetConfigIds: string[];
}> = {
    definition: {
        id: "firebot:toggle-overlay-widgets",
        name: "オーバーレイウィジェット切り替え",
        description: "オーバーレイウィジェットの有効状態を切り替えます。",
        icon: "fad fa-toggle-off",
        categories: ["overlay", "advanced", "firebot control"],
        dependencies: []
    },
    optionsTemplate: `
        <div ng-hide="hasWidgets">
            <p>このエフェクトを使うにはオーバーレイウィジェットを作成する必要があります。<b>オーバーレイウィジェット</b>タブから作成してください。</p>
        </div>
        <div ng-show="hasWidgets">

            <eos-container header="モード">
                <firebot-radio-cards
                    options="modes"
                    ng-model="effect.mode"
                    grid-columns="3"
                ></firebot-radio-cards>
            </eos-container>

            <eos-container header="オーバーレイウィジェット" pad-top="true" ng-if="effect.mode != null">
                <multiselect-list
                    model="effect.widgetConfigIds"
                    options="widgetOptions"
                    settings="{ options: widgetOptions }"
                />
            </eos-container>
        </div>
    `,
    optionsController: ($scope, overlayWidgetsService) => {
        $scope.hasWidgets = overlayWidgetsService.overlayWidgetConfigs.length > 0;

        $scope.widgetOptions = overlayWidgetsService.overlayWidgetConfigs.map((w: OverlayWidgetConfig) => {
            const type = overlayWidgetsService.getOverlayWidgetType(w.type);
            return {
                id: w.id,
                name: w.name,
                description: type ? type.name : "不明な種類",
                iconClass: type ? type.icon : "fa-question"
            };
        });

        $scope.modes = [
            {
                value: "toggle",
                label: "切り替え",
                iconClass: "fa-exchange"
            },
            {
                value: "enable",
                label: "有効化",
                iconClass: "fa-toggle-on"
            },
            {
                value: "disable",
                label: "無効化",
                iconClass: "fa-toggle-off"
            }
        ];

        if ($scope.effect.widgetConfigIds == null) {
            $scope.effect.widgetConfigIds = [];
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (effect.mode == null) {
            errors.push("モードを選択してください。");
        }

        if (!effect.widgetConfigIds?.length) {
            errors.push("オーバーレイウィジェットを 1 つ以上選択してください。");
        }

        return errors;
    },
    getDefaultLabel: (effect) => {
        const modeMap: Record<string, string> = {
            toggle: "切り替え",
            enable: "有効化",
            disable: "無効化"
        };
        return `${effect.widgetConfigIds?.length ?? 0} 件のオーバーレイウィジェットを ${modeMap[effect.mode] ?? effect.mode}`;
    },
    onTriggerEvent: (event) => {
        const { effect } = event;

        if (effect.mode == null) {
            return false;
        }

        const widgetConfigs = effect.widgetConfigIds
            ?.map((id: string) => overlayWidgetConfigManager.getItem(id))
            .filter((w): w is OverlayWidgetConfig => w != null) ?? [];

        if (widgetConfigs.length === 0) {
            return false;
        }

        for (const widgetConfig of widgetConfigs) {
            let newStatus: boolean;
            if (effect.mode === "toggle") {
                newStatus = !widgetConfig.active;
            } else if (effect.mode === "enable") {
                newStatus = true;
            } else { // disable
                newStatus = false;
            }
            if (widgetConfig.active !== newStatus) {
                const updatedConfig: OverlayWidgetConfig = {
                    ...widgetConfig,
                    active: newStatus
                };
                overlayWidgetConfigManager.saveWidgetConfig(updatedConfig);
                overlayWidgetConfigManager.triggerUiRefresh();
            }
        }

        return true;
    }
};

export = effect;