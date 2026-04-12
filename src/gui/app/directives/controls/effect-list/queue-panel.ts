"use strict";

import type {
    FirebotComponent,
    EffectQueuesService,
    ModalFactory,
    EffectList
} from "../../../../../types";
import type { DropdownAction, DropdownOption } from "../firebot-dropdown";
import type { PreviewItem } from "./effect-config-panel";

type Bindings = {
    effectsData: EffectList;
    onUpdate: () => void;
};

type Controller = {
    eqs: EffectQueuesService;
    getSelectedEffectQueueName: () => string;
    getSelectedQueueModeIsCustom: () => boolean;
    toggleQueueSelection: (queueId: string) => void;
    validQueueSelected: () => boolean;
    showAddEditEffectQueueModal: (queueId?: string) => void;
    showDeleteEffectQueueModal: (queueId: string) => void;
    openEditQueueDurationModal: () => void;
    getQueueOptions: () => DropdownOption[];
    getQueueActions: () => DropdownAction[];
    selectedUpdated: () => void;
    updatePreviewItems: () => void;
    options: DropdownOption[];
    actions: DropdownAction[];
    previewItems: PreviewItem[];
    mainValue: PreviewItem;
};

(function () {
    const queuePanel: FirebotComponent<Bindings, Controller> = {
        bindings: {
            effectsData: "<",
            onUpdate: "&"
        },
        template: `
            <effect-config-panel
                icon="fa-stream"
                label="キュー"
                tooltip="エフェクトキューを使うと、エフェクト同士が重ならないように順番に実行できます。特にイベントで便利です。"
                main-value="$ctrl.mainValue"
                preview-items="$ctrl.previewItems"
                no-bottom-margin="true"
            >
                <div style="padding: 14px 0;">
                    <firebot-dropdown
                        ng-model="$ctrl.effectsData.queue"
                        ng-change="$ctrl.selectedUpdated()"
                        options="$ctrl.options"
                        actions="$ctrl.actions"
                        placeholder="キューを選択"
                        empty-message="キューが作成されていません"
                        dark="true"
                    />
                </div>

                <div class="config-panel-control" ng-if="$ctrl.validQueueSelected()">
                    <div class="config-control-label">
                        <i class="far fa-arrow-up"></i>
                        <span>優先度</span>
                        <tooltip role="tooltip" aria-label="エフェクトリストを優先にすると、優先設定されていない他のリストより前にキューへ追加されます。" text="'エフェクトリストを優先にすると、優先設定されていない他のリストより前にキューへ追加されます。'"></tooltip>
                    </div>
                    <div>
                        <toggle-button
                            toggle-model="$ctrl.effectsData.queuePriority === 'high'"
                            on-toggle="$ctrl.updateQueuePriority(newValue)"
                            font-size="32"
                        ></toggle-button>
                    </div>
                </div>

                <div class="config-panel-control" ng-if="$ctrl.getSelectedQueueModeIsCustom()">
                    <div class="config-control-label">
                        <i class="far fa-clock"></i>
                        <span>エフェクト実行時間</span>
                        <tooltip role="tooltip" aria-label="このエフェクトリスト実行後に次を実行するまで、キューが待機する秒数です。" text="'このエフェクトリスト実行後に次を実行するまで、キューが待機する秒数です。'"></tooltip>
                    </div>
                    <div class="config-control-input">
                        <button
                            class="config-duration-btn"
                            ng-click="$ctrl.openEditQueueDurationModal()"
                            aria-label="エフェクト実行時間: {{$ctrl.effectsData.queueDuration || 0}} 秒"
                            role="button"
                        >
                            <span class="config-duration-value">{{$ctrl.effectsData.queueDuration || 0}}s</span>
                            <i class="far fa-edit"></i>
                        </button>
                    </div>
                </div>
            </effect-config-panel>
        `,
        controller: function (
            $scope: angular.IScope,
            effectQueuesService: EffectQueuesService,
            modalFactory: ModalFactory
        ) {
            const $ctrl = this;

            $ctrl.eqs = effectQueuesService;

            $ctrl.options = [];
            $ctrl.actions = [];
            $ctrl.previewItems = [];

            function buildOptionsAndActions() {
                $ctrl.options = $ctrl.getQueueOptions();
                $ctrl.actions = $ctrl.getQueueActions();
            }

            $scope.$watchCollection(() => effectQueuesService.effectQueues, () => {
                buildOptionsAndActions();
            });

            $ctrl.$onInit = $ctrl.$onChanges = () => {
                buildOptionsAndActions();
                $ctrl.updatePreviewItems();
            };

            $ctrl.selectedUpdated = () => {
                buildOptionsAndActions();
                $ctrl.updatePreviewItems();
                $ctrl.onUpdate();
            };

            $ctrl.updatePreviewItems = () => {
                const queue = $ctrl.effectsData.queue ? effectQueuesService.getEffectQueue($ctrl.effectsData.queue) : null;
                const modeInfo = queue ? effectQueuesService.queueModes.find(mode => mode.value === queue.mode) : null;

                $ctrl.mainValue = {
                    icon: queue ? modeInfo?.iconClass ?? "fa-stream" : 'fa-ban',
                    label: $ctrl.getSelectedEffectQueueName(),
                    tooltip: (modeInfo?.description ? `${modeInfo.label} キュー: ${modeInfo.description}` : null) ?? "このエフェクトリストはトリガー時に即時実行されます。"
                };

                const items: PreviewItem[] = [];

                if ($ctrl.validQueueSelected()) {
                    if ($ctrl.effectsData.queuePriority && $ctrl.effectsData.queuePriority === "high") {
                        items.push({
                            icon: "fa-arrow-up",
                            label: "優先",
                            tooltip: "優先度あり"
                        });
                    }
                }

                if ($ctrl.getSelectedQueueModeIsCustom()) {
                    items.push({
                        icon: "fa-clock",
                        label: `${$ctrl.effectsData.queueDuration || 0}s`,
                        tooltip: "エフェクト実行時間"
                    });
                }

                $ctrl.previewItems = items;
            };

            $ctrl.updateQueuePriority = (isHighPriority: boolean) => {
                $ctrl.effectsData.queuePriority = isHighPriority ? "high" : "none";
                $ctrl.updatePreviewItems();
                $ctrl.onUpdate();
            };

            $ctrl.getSelectedEffectQueueName = () => {
                const unsetDisplay = "なし";
                if ($ctrl.effectsData.queue == null) {
                    return unsetDisplay;
                }

                const queue = effectQueuesService.getEffectQueue($ctrl.effectsData.queue);
                if (queue == null) {
                    return unsetDisplay;
                }

                return queue.name;
            };

            $ctrl.getSelectedQueueModeIsCustom = () => {
                if ($ctrl.effectsData.queue == null) {
                    return false;
                }

                const queue = effectQueuesService.getEffectQueue($ctrl.effectsData.queue);
                if (queue == null) {
                    return false;
                }

                return queue.mode === "custom";
            };

            $ctrl.getQueueOptions = (): DropdownOption[] => {
                const queues = effectQueuesService.getEffectQueues();
                const queueOptions: DropdownOption[] = queues.map((queue) => {
                    const modeInfo = effectQueuesService.queueModes.find(mode => mode.value === queue.mode);
                    return {
                        name: queue.name,
                        value: queue.id,
                        icon: modeInfo?.iconClass ?? "fa-stream",
                        chip: modeInfo ? modeInfo.label : undefined,
                        chipTooltip: modeInfo ? modeInfo.description : undefined
                    };
                });
                return [
                    {
                        name: "なし",
                        value: null,
                        icon: "fa-ban"
                    },
                    ...queueOptions
                ];
            };

            $ctrl.getQueueActions = () => {
                const actions: DropdownAction[] = [
                    {
                        label: "新しいキューを作成",
                        icon: "fa-plus-circle",
                        type: "info",
                        onSelect: () => {
                            $ctrl.showAddEditEffectQueueModal();
                        }
                    }
                ];

                if ($ctrl.validQueueSelected()) {
                    actions.push(
                        {
                            label: `"${$ctrl.getSelectedEffectQueueName()}" を編集`,
                            icon: "fa-edit",
                            type: "info",
                            onSelect: () => {
                                $ctrl.showAddEditEffectQueueModal($ctrl.effectsData.queue);
                            }
                        },
                        {
                            label: `"${$ctrl.getSelectedEffectQueueName()}" を削除`,
                            icon: "fa-trash-alt",
                            type: "danger",
                            onSelect: () => {
                                $ctrl.showDeleteEffectQueueModal($ctrl.effectsData.queue);
                            }
                        }
                    );
                }
                return actions;
            };

            $ctrl.validQueueSelected = () => {
                if ($ctrl.effectsData.queue == null) {
                    return false;
                }

                const queue = effectQueuesService.getEffectQueue($ctrl.effectsData.queue);
                return queue != null;
            };

            $ctrl.showAddEditEffectQueueModal = (queueId?: string) => {
                void effectQueuesService.showAddEditEffectQueueModal(queueId).then((id) => {
                    $ctrl.effectsData.queue = id;
                    $ctrl.updatePreviewItems();
                    $ctrl.onUpdate();
                });
            };

            $ctrl.showDeleteEffectQueueModal = (queueId: string) => {
                void effectQueuesService.showDeleteEffectQueueModal(queueId).then((confirmed) => {
                    if (confirmed) {
                        $ctrl.effectsData.queue = undefined;
                        $ctrl.updatePreviewItems();
                        $ctrl.onUpdate();
                    }
                });
            };

            $ctrl.openEditQueueDurationModal = () => {
                modalFactory.openGetInputModal(
                    {
                        model: $ctrl.effectsData.queueDuration || 0,
                        label: "エフェクト実行時間を編集",
                        saveText: "保存",
                        inputPlaceholder: "秒数を入力",
                        validationFn: (value) => {
                            return new Promise((resolve) => {
                                if (value == null || value < 0) {
                                    return resolve(false);
                                }
                                resolve(true);
                            });
                        },
                        validationText: "値は0より大きい必要があります。"
                    },
                    (newDuration) => {
                        $ctrl.effectsData.queueDuration = newDuration;
                        $ctrl.updatePreviewItems();
                        $ctrl.onUpdate();
                    }
                );
            };
        }
    };

    // @ts-ignore
    angular.module("firebotApp").component("queuePanel", queuePanel);
})();
