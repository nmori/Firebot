"use strict";
(function() {
    angular
        .module('firebotApp')
        .component("quickActions", {
            template: `
                <div class="quick-actions flex flex-col items-center text-2xl pb-4">
                    <div ng-repeat="action in quickActionsService.quickActions track by $index" class="mt-4 draggableAction" ng-show="$ctrl.settings[action.id].enabled">
                        <button
                            ng-if="action.type === 'system'"
                            class="quick-action-btn p-0"
                            ng-click="$ctrl.triggerQuickAction(action.id)"
                            uib-tooltip="{{action.name}}"
                            append-tooltip-to-body="true"
                            tooltip-placement="right"
                            aria-label="{{action.name}}"
                        >
                            <i class="{{action.icon}}" ng-if="action.icon"></i>
                        </button>

                        <button
                            ng-if="action.type === 'custom'"
                            class="quick-action-btn p-0"
                            ng-click="$ctrl.triggerQuickAction(action.id)"
                            uib-tooltip="{{action.name}}"
                            append-tooltip-to-body="true"
                            tooltip-placement="right"
                            aria-label="{{action.name}}"
                            context-menu="$ctrl.customQuickActionsContextMenu(action)"
                            context-menu-orientation="right"
                        >
                            <i class="{{action.icon}}" ng-if="action.icon"></i>
                        </button>
                    </div>
                </div>
                <hr class="my-4 flex flex-col items-center">
                <div class="quick-action-settings flex flex-col items-center mb-4">
                    <button
                        class="quick-action-btn p-0"
                        uib-tooltip="Add Custom Quick Action"
                        append-tooltip-to-body="true"
                        tooltip-placement="right"
                        ng-click="quickActionsService.showAddOrEditCustomQuickActionModal()"
                        aria-label="クイックアクションの追加"
                    >
                        <i class="fas fa-plus"></i>
                    </button>

                    <button
                        class="quick-action-btn p-0 mt-4"
                        uib-tooltip="クイックアクション設定"
                        append-tooltip-to-body="true"
                        tooltip-placement="right"
                        ng-click="$ctrl.openQuickActionSettingsModal()"
                        aria-label="クイックアクション設定"
                    >
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            `,
            controller: function($scope, utilityService, backendCommunicator, settingsService, quickActionsService, logger) {
                const $ctrl = this;

                $scope.quickActionsService = quickActionsService;
                $scope.logger = logger;

                $ctrl.settings = settingsService.getQuickActionSettings();

                $ctrl.triggerQuickAction = (quickActionId) => {
                    backendCommunicator.fireEvent("triggerQuickAction", quickActionId);
                };

                $ctrl.$onInit = async () => {
                    if (quickActionsService.quickActions == null || !quickActionsService.quickActions.length) {
                        await quickActionsService.loadQuickActions();
                    }

                    if ($ctrl.settings == null) {
                        $ctrl.settings = {};

                        let position = 0;
                        quickActionsService.quickActions.forEach(qa => {
                            $ctrl.settings[qa.id] = {
                                enabled: true,
                                position: position++
                            };
                        });

                        settingsService.setQuickActionSettings($ctrl.settings);
                    }
                };

                $ctrl.customQuickActionsContextMenu = (customQuickAction) => {
                    const options = [
                        {
                            html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> 編集</a>`,
                            click: () => {
                                quickActionsService.showAddOrEditCustomQuickActionModal(customQuickAction);
                            }
                        },
                        {
                            html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> 削除</a>`,
                            click: () => {
                                utilityService
                                    .showConfirmationModal({
                                        title: "クイックアクションの削除",
                                        question: `クイックアクション「"${customQuickAction.name}"」を削除しますか?`,
                                        confirmLabel: "削除する",
                                        confirmBtnType: "btn-danger"
                                    })
                                    .then(confirmed => {
                                        if (confirmed) {
                                            quickActionsService.deleteCustomQuickAction(customQuickAction.id);

                                            delete $ctrl.settings[customQuickAction.id];
                                            settingsService.setQuickActionSettings($ctrl.settings);
                                        }
                                    });

                            },
                            compile: true
                        }
                    ];

                    return options;
                };

                $ctrl.openQuickActionSettingsModal = () => {
                    utilityService.showModal({
                        component: "quickActionSettingsModal",
                        size: "sm",
                        resolveObj: {
                            quickActions: () => quickActionsService.quickActions,
                            settings: () => $ctrl.settings
                        },
                        dismissCallback: () => {
                            settingsService.setQuickActionSettings($ctrl.settings);
                        }
                    });
                };
            }
        });
}());