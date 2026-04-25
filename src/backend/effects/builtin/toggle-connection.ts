import type { EffectType } from "../../../types/effects";
import connectionManager from "../../common/connection-manager";
import integrationManager from "../../integrations/integration-manager";

interface Service {
    id: string;
    action: boolean | "toggle";
}

const effect: EffectType<{
    mode: "all" | "custom";
    allAction: boolean | "toggle";
    services: Service[];
}> = {
    definition: {
        id: "firebot:toggleconnection",
        name: "接続切り替え",
        description: "Twitch および連携済み Integrations との接続状態を切り替えます",
        icon: "fad fa-plug",
        categories: ["advanced", "firebot control"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="モード">
            <div style="padding-left: 10px;">
                <label class="control-fb control--radio">すべての接続 <span class="muted"><br />すべての接続（Twitch および連携済み Integrations）を更新</span>
                    <input type="radio" ng-model="effect.mode" value="all"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio" >カスタム接続 <span class="muted"><br />更新する接続を個別に選択</span>
                    <input type="radio" ng-model="effect.mode" value="custom"/>
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>

        <eos-container ng-show="effect.mode === 'all'" header="操作" pad-top="true">
            <dropdown-select options="{ toggle: '切り替え', true: '接続', false: '切断'}" selected="effect.allAction"></dropdown-select>
        </eos-container>

        <eos-container ng-show="effect.mode === 'custom'" header="接続" pad-top="true">
            <div ng-repeat="service in services">
                <label class="control-fb control--checkbox">{{service.name}}
                    <input type="checkbox" ng-click="toggleServiceSelected(service.id)" ng-checked="serviceIsSelected(service.id)"  aria-label="{{service.name}} の切り替え" >
                    <div class="control__indicator"></div>
                </label>
                <div ng-show="serviceIsSelected(service.id)" style="margin-bottom: 15px;">
                    <div class="btn-group" uib-dropdown>
                        <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                        {{getConnectionActionDisplay(service.id)}} <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                            <li role="menuitem" ng-click="setConnectionAction(service.id, true)"><a href>接続</a></li>
                            <li role="menuitem" ng-click="setConnectionAction(service.id, false)"><a href>切断</a></li>
                            <li role="menuitem" ng-click="setConnectionAction(service.id, 'toggle')"><a href>切り替え</a></li>
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

        $scope.serviceIsSelected = serviceId => $scope.effect.services.some(s => s.id === serviceId);

        $scope.toggleServiceSelected = (serviceId: string) => {
            if ($scope.serviceIsSelected(serviceId)) {
                $scope.effect.services = $scope.effect.services.filter(
                    s => s.id !== serviceId
                );
            } else {
                $scope.effect.services.push({
                    id: serviceId,
                    action: 'toggle'
                });
            }
        };

        $scope.setConnectionAction = (
            serviceId: string,
            action: boolean | "toggle"
        ) => {
            const service = $scope.effect.services.find(
                s => s.id === serviceId
            );
            if (service != null) {
                service.action = action;
            }
        };

        $scope.getConnectionActionDisplay = (serviceId) => {
            const service = $scope.effect.services.find(
                s => s.id === serviceId
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
        const errors: string[] = [];
        if (effect.mode == null) {
            errors.push("モードを選択してください。");
        } else if (effect.mode === "custom" && (effect.services == null || effect.services.length < 1)) {
            errors.push("更新する接続を 1 つ以上選択してください。");
        }

        return errors;
    },
    getDefaultLabel: (effect) => {
        const action = effect.allAction === "toggle"
            ? "切り替え"
            : effect.allAction === true ? "接続" : "切断";
        if (effect.mode === "all") {
            return `すべての接続を ${action}`;
        }

        return `${effect.services.length} 件の接続を更新`;
    },
    onTriggerEvent: async ({ effect }) => {
        let services: Service[];
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
                            id: `integration.${i.id}`,
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

export = effect;