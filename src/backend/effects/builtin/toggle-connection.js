"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');

const toggleConnection = {
    definition: {
        id: "firebot:toggleconnection",
        name: "接続状態を切り替え",
        description: "Twitchとリンクされた連携接続状態を切り替える",
        icon: "fad fa-plug",
        categories: [EffectCategory.ADVANCED],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container header="Mode">
            <div style="padding-left: 10px;">
                <label class="control-fb control--radio">全接続<span class="muted"><br />すべての接続を更新する（Twitchとリンクされた連携機能）</span>
                    <input type="radio" ng-model="effect.mode" value="all"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio" >いくつかの接続 <span class="muted"><br />更新する接続を選択する</span>
                    <input type="radio" ng-model="effect.mode" value="custom"/>
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>

        <eos-container ng-show="effect.mode === 'all'" header="アクション" pad-top="true">
            <dropdown-select options="{ toggle: 'Toggle', true: 'Connect', false: 'Disconnect'}" selected="effect.allAction"></dropdown-select>
        </eos-container>

        <eos-container ng-show="effect.mode === 'custom'" header="接続" pad-top="true">
            <div ng-repeat="service in services">
                <label class="control-fb control--checkbox">{{service.name}}
                    <input type="checkbox" ng-click="toggleServiceSelected(service.id)" ng-checked="serviceIsSelected(service.id)"  aria-label="Toggle {{service.name}}" >
                    <div class="control__indicator"></div>
                </label>
                <div ng-show="serviceIsSelected(service.id)" style="margin-bottom: 15px;">
                    <div class="btn-group" uib-dropdown>
                        <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                        {{getConnectionActionDisplay(service.id)}} <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                            <li role="menuitem" ng-click="setConnectionAction(service.id, true)"><a href>Connect</a></li>
                            <li role="menuitem" ng-click="setConnectionAction(service.id, false)"><a href>Disconnect</a></li>
                            <li role="menuitem" ng-click="setConnectionAction(service.id, 'toggle')"><a href>Toggle</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </eos-container>
    `,
    optionsController: ($scope, integrationService) => {

        if ($scope.effect.allAction == null) {
            $scope.effect.allAction = "toggle";
        }

        $scope.services = [
            {
                id: "chat",
                name: "Twitch"
            },
            ...integrationService.getLinkedIntegrations().map(i => ({
                id: `integration.${i.id}`,
                name: i.name
            }))
        ];

        if ($scope.effect.services == null) {
            $scope.effect.services = [];
        }

        $scope.serviceIsSelected = (serviceId) => $scope.effect.services.some(s => s.id === serviceId);

        $scope.toggleServiceSelected = (serviceId) => {
            if ($scope.serviceIsSelected(serviceId)) {
                $scope.effect.services = $scope.effect.services.filter(
                    (s) => s.id !== serviceId
                );
            } else {
                $scope.effect.services.push({
                    id: serviceId,
                    action: 'toggle'
                });
            }
        };

        $scope.setConnectionAction = (
            serviceId,
            action
        ) => {
            const service = $scope.effect.services.find(
                (s) => s.id === serviceId
            );
            if (service != null) {
                service.action = action;
            }
        };

        $scope.getConnectionActionDisplay = (serviceId) => {
            const service = $scope.effect.services.find(
                (s) => s.id === serviceId
            );
            if (service == null) {
                return "";
            }

            if (service.action === "toggle") {
                return "切り替え";
            }
            if (service.action === true) {
                return "接続";
            }
            return "切断";
        };


    },
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.mode == null) {
            errors.push("モードを選択してください。");
        } else if (effect.mode === "custom" && (effect.services == null || effect.services.length < 1)) {
            errors.push("更新する接続を少なくとも1つ選択してください。");
        }

        return errors;
    },
    onTriggerEvent: async ({ effect }) => {
        const connectionManager = require("../../common/connection-manager");
        const integrationManager = require("../../integrations/integration-manager");

        let services;
        // here for backwards compat, just toggle twitch
        if (effect.mode == null) {
            services = [
                {
                    id: "chat",
                    action: "toggle"
                }
            ];
        } else {
            if (effect.mode === "all") {

                services = [
                    {
                        id: "chat",
                        action: effect.allAction
                    },
                    ...integrationManager
                        .getAllIntegrationDefinitions()
                        .filter(i => integrationManager.integrationIsConnectable(i.id))
                        .map(i => ({
                            id: i.id,
                            action: effect.allAction
                        }))
                ];
            } else if (effect.mode === "custom") {
                services = effect.services;
            }
        }

        await connectionManager.updateConnectionForServices(services);
    }
};

module.exports = toggleConnection;
