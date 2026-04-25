import { EffectType } from "../../../../types/effects";
import { OverlayWidgetConfig, Position } from "../../../../types/overlay-widgets";
import overlayWidgetConfigManager from "../../../overlay-widgets/overlay-widget-config-manager";
import overlayWidgetsManager from "../../../overlay-widgets/overlay-widgets-manager";
import logger from "../../../logwrapper";

const model: EffectType<{
    widgetConfigId: string;
    mode: "update" | "reset";
    saveChanges?: boolean;
    settings?: Record<string, unknown>;
    position?: Position | null;
    zIndex?: number | null;
    overlayInstance?: string | null;
}> = {
    definition: {
        id: "firebot:update-overlay-widget-settings",
        name: "オーバーレイウィジェット設定更新",
        description: "オーバーレイウィジェットの設定を更新します。",
        icon: "fad fa-layer-plus",
        categories: ["overlay", "advanced"],
        dependencies: []
    },
    optionsTemplate: `
        <div ng-hide="hasWidgets">
            <p>このエフェクトを使うにはオーバーレイウィジェットを作成する必要があります。<b>オーバーレイウィジェット</b>タブから作成してください。</p>
        </div>
        <div ng-show="hasWidgets">
            <eos-container header="更新するオーバーレイウィジェット">
                <firebot-searchable-select
                    ng-model="effect.widgetConfigId"
                    placeholder="ウィジェットを選択または検索..."
                    items="widgetOptions"
                    on-select="onSelectWidgetConfig(item)"
                />
            </eos-container>

            <eos-container header="モード" pad-top="true" ng-if="effect.widgetConfigId != null">
                <firebot-radio-cards
                    options="modes"
                    ng-model="effect.mode"
                ></firebot-radio-cards>

                <firebot-checkbox
                    ng-if="effect.mode == 'update'"
                    label="変更を保存"
                    model="effect.saveChanges"
                    tooltip="チェックを入れると、ウィジェット設定への変更がウィジェット構成に保存されます。"
                    style="margin: 15px 0 0 0"
                />
            </eos-container>


            <div ng-if="effect.mode == 'update'">
                <eos-container header="カスタマイズ" pad-top="true">
                    <div ng-if="selectedType && (!selectedType.userCanConfigure || selectedType.userCanConfigure.position !== false)">
                        <firebot-checkbox
                            label="位置を編集"
                            ng-init="editPosition = (effect.position != null && effect.position !== ''); showTopLevelProp.position = editPosition"
                            model="editPosition"
                            on-change="topLevelPropToggled('position', newValue)"
                            style="margin: 0px 15px 0px 0px"
                        />
                        <div ng-if="showTopLevelProp.position" class="ml-5 mb-10">
                            <overlay-position-editor
                                model="effect.position"
                                min-width="25"
                                min-height="25"
                            ></overlay-position-editor>
                        </div>
                    </div>

                    <div>
                        <firebot-checkbox
                            label="z-index を編集"
                            ng-init="editZIndex = (effect.zIndex != null && effect.zIndex !== ''); showTopLevelProp.zIndex = editZIndex"
                            model="editZIndex"
                            on-change="topLevelPropToggled('zIndex', newValue)"
                            style="margin: 0px 15px 0px 0px"
                        />
                        <div ng-if="showTopLevelProp.zIndex" class="ml-5 mb-10">
                            <input
                                type="number"
                                class="form-control"
                                ng-model="effect.zIndex"
                                placeholder="数値を入力"
                            />
                        </div>
                    </div>

                    <div>
                        <firebot-checkbox
                            label="オーバーレイインスタンスを編集"
                            ng-init="editOverlayInstance = (effect.overlayInstance != null && effect.overlayInstance !== ''); showTopLevelProp.overlayInstance = editOverlayInstance"
                            model="editOverlayInstance"
                            on-change="topLevelPropToggled('overlayInstance', newValue)"
                            style="margin: 0px 15px 0px 0px"
                        />
                        <div ng-if="showTopLevelProp.overlayInstance" class="ml-5 mb-10">
                            <select class="fb-select" id="overlay-instance" ng-model="effect.overlayInstance">
                                <option label="デフォルト" value="">デフォルト</option>
                                <option ng-repeat="instance in overlayInstances" label="{{instance}}" value="{{instance}}">{{instance}}</option>
                            </select>
                        </div>
                    </div>

                    <div ng-if="typeHasSettings">
                        <hr class="mt-0" />

                        <div ng-repeat="setting in settingsSchema">
                            <firebot-checkbox
                                label="編集: {{setting.title || setting.name}}"
                                ng-init="editSetting[setting.name] = (effect.settings[setting.name] != null && effect.settings[setting.name] !== ''); showSetting[setting.name] = editSetting[setting.name]"
                                model="editSetting[setting.name]"
                                on-change="settingsPropToggled(setting.name, newValue)"
                                style="margin: 0px 15px 0px 0px"
                            />
                            <div ng-if="showSetting[setting.name]" class="ml-5 mb-10">
                                <dynamic-parameter
                                    name="{{setting.name}}"
                                    schema="setting"
                                    ng-model="effect.settings[setting.name]"
                                    hide-title-and-description="true"
                                    trigger="trigger"
                                    trigger-meta="triggerMeta"
                                    enable-replace-variables="true"
                                >
                                </dynamic-parameter>
                            </div>
                        </div>
                    </div>
                </eos-container>
            </div>
        </div>
    `,
    optionsController: ($scope, overlayWidgetsService, settingsService) => {

        $scope.editSetting = {};
        $scope.showSetting = {};
        $scope.showTopLevelProp = {};

        $scope.hasWidgets = overlayWidgetsService.overlayWidgetConfigs.length > 0;

        $scope.overlayInstances = settingsService.getSetting("OverlayInstances");

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
                value: "update",
                label: "更新",
                description: "ウィジェット設定を新しい値で更新します。",
                iconClass: "fa-edit"
            },
            {
                value: "reset",
                label: "リセット",
                description: "ウィジェット設定をデフォルト値にリセットします。",
                iconClass: "fa-undo"
            }
        ];

        if ($scope.effect.settings == null) {
            $scope.effect.settings = {};
        }

        $scope.selectedType = null;
        $scope.settingsSchema = [];
        $scope.selectedConfig = null;
        $scope.typeHasSettings = false;

        function loadSelectedConfig(id: string) {
            const foundConfig = overlayWidgetsService.getOverlayWidgetConfig(id);
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            $scope.selectedConfig = foundConfig ? angular.copy(foundConfig) : null;
            if ($scope.selectedConfig == null) {
                $scope.selectedType = null;
                $scope.settingsSchema = [];
                $scope.typeHasSettings = false;
                return;
            }
            $scope.selectedType = overlayWidgetsService
                .getOverlayWidgetType($scope.selectedConfig.type);
            $scope.settingsSchema = ($scope.selectedType?.settingsSchema || []).filter((s) => {
                return !($scope.selectedType?.nonEditableSettings?.includes(s.name) ?? false);
            });
            $scope.typeHasSettings = !!$scope.settingsSchema?.length;
        }

        $scope.topLevelPropToggled = (prop: string, newValue: boolean) => {
            if (newValue) {
                $scope.effect[prop] = $scope.selectedConfig?.[prop] ?? null;
                $scope.showTopLevelProp[prop] = true;
            } else {
                delete $scope.effect[prop];
                $scope.showTopLevelProp[prop] = false;
            }
        };

        $scope.settingsPropToggled = (prop: string, newValue: boolean) => {
            if (newValue) {
                $scope.effect.settings[prop] = $scope.selectedConfig?.settings?.[prop] ?? null;
                $scope.showSetting[prop] = true;
            } else {
                delete $scope.effect.settings[prop];
                $scope.showSetting[prop] = false;
            }
        };

        if ($scope.effect.widgetConfigId != null) {
            loadSelectedConfig($scope.effect.widgetConfigId);
        }

        $scope.onSelectWidgetConfig = (item: { id: string }) => {
            $scope.editSetting = {};
            $scope.showSetting = {};
            $scope.showTopLevelProp = {};
            $scope.effect.settings = {};
            $scope.effect.position = null;
            $scope.effect.zIndex = null;
            $scope.effect.overlayInstance = null;
            $scope.effect.mode = null;
            loadSelectedConfig(item.id);
        };

        $scope.$watch("effect.mode", (newValue, oldValue) => {
            if (newValue === oldValue) {
                return;
            }
            $scope.editSetting = {};
            $scope.showSetting = {};
            $scope.showTopLevelProp = {};
            $scope.effect.settings = {};
            $scope.effect.position = null;
            $scope.effect.zIndex = null;
            $scope.effect.overlayInstance = null;
        });
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (effect.widgetConfigId == null) {
            errors.push("オーバーレイウィジェットを選択してください。");
        }

        if (effect.mode == null) {
            errors.push("モードを選択してください。");
        }

        return errors;
    },
    getDefaultLabel: (effect, overlayWidgetsService) => {
        const overlayWidgetName = overlayWidgetsService.getOverlayWidgetConfig(effect.widgetConfigId)?.name ?? "不明なオーバーレイウィジェット";
        return `${overlayWidgetName} を ${effect.mode === "update" ? "更新" : "リセット"}`;
    },
    onTriggerEvent: (event) => {
        const { effect } = event;

        if (effect.widgetConfigId == null) {
            return false;
        }

        const widgetConfig = overlayWidgetConfigManager.getItem(effect.widgetConfigId);

        if (!widgetConfig) {
            logger.warn(`Failed to update Overlay Widget ${effect.widgetConfigId} because it does not exist.`);
            return false;
        }

        if (effect.mode === "reset") {
            void overlayWidgetsManager.sendWidgetEventToOverlay("settings-update", widgetConfig);
        } else if (effect.mode === "update") {
            const updatedConfig: OverlayWidgetConfig = {
                ...widgetConfig,
                settings: {
                    ...widgetConfig.settings,
                    ...effect.settings
                },
                position: effect.position ?? widgetConfig.position,
                zIndex: effect.zIndex ?? widgetConfig.zIndex,
                overlayInstance: effect.overlayInstance ?? widgetConfig.overlayInstance
            };

            if (effect.saveChanges) {
                overlayWidgetConfigManager.saveWidgetConfig(updatedConfig);
                overlayWidgetConfigManager.triggerUiRefresh();
            } else {
                void overlayWidgetsManager.sendWidgetEventToOverlay("settings-update", updatedConfig);
            }
        }

        return true;
    }
};

export = model;