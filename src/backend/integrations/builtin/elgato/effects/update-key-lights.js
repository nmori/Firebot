"use strict";

const { EffectCategory } = require("../../../../../shared/effect-constants");
const { integration } = require("../elgato");

const effect = {
    definition: {
        id: "elgato:key-lights",
        name: "キーライトの更新",
        description: "キーライトのオン/オフ、温度と明るさの変更。",
        icon: "fad fa-lamp fa-align-center",
        categories: [EffectCategory.INTEGRATIONS],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container ng-if="!hasKeylights">
        キーライトは接続されていません
        </eos-container>
        <eos-container ng-if="hasKeylights" header="キーライト">
            <div ng-repeat="light in keyLights" class="mb-16">
                <label class="control-fb control--checkbox">{{light.name}}
                    <input type="checkbox" ng-click="selectLight(light)" ng-checked="isLightSelected(light)" aria-label="..." >
                    <div class="control__indicator"></div>
                </label>

                <div ng-if="isLightSelected(light)" class="ml-6 mb-10">
                    <label class="control-fb control--checkbox">アップデートの有効化
                        <input type="checkbox" ng-click="selectOption('toggleType', light)" ng-checked="isOptionSelected('toggleType', light)" aria-label="..." >
                        <div class="control__indicator"></div>
                    </label>
                    <dropdown-select
                        ng-if="isOptionSelected('toggleType', light)"
                        options="toggleOptions"
                        selected="effect.selectedLights[light.name].options.toggleType"
                    ></dropdown-select>
                </div>

                <div ng-if="isLightSelected(light)" class="ml-6 mb-10">
                    <label class="control-fb control--checkbox">明るさの更新
                        <input type="checkbox" ng-click="selectOption('brightness', light)" ng-checked="isOptionSelected('brightness', light)" aria-label="..." >
                        <div class="control__indicator"></div>
                    </label>
                    <div class="input-group" ng-if="isOptionSelected('brightness', light)">
                        <span class="input-group-addon">% (1 - 100)</span>
                        <input
                            class="form-control"
                            type="number"
                            placeholder="1 - 100"
                            ng-model="effect.selectedLights[light.name].options.brightness"
                            replace-variables>
                    </div>
                </div>

                <div ng-if="isLightSelected(light)" class="ml-6 mb-10">
                    <label class="control-fb control--checkbox">色温度の更新
                        <input type="checkbox" ng-click="selectOption('temperature', light)" ng-checked="isOptionSelected('temperature', light)" aria-label="..." >
                        <div class="control__indicator"></div>
                    </label>
                    <div class="input-group" ng-if="isOptionSelected('temperature', light)">
                        <span class="input-group-addon">色温度(2900 - 7000)</span>
                        <input
                            class="form-control"
                            type="number"
                            placeholder="2900 - 7000"
                            ng-model="effect.selectedLights[light.name].options.temperature"
                            replace-variables>
                    </div>
                </div>
            </div>
        </eos-container>
    `,
    optionsController: async ($scope, $q, backendCommunicator) => {
        $scope.hasKeylights = false;
        $scope.keyLights = [];

        if (!$scope.effect.selectedLights) {
            $scope.effect.selectedLights = {};
        }

        $q.when(backendCommunicator.fireEventAsync("getKeyLights"))
            .then(keyLights => {
                if (keyLights?.length > 0) {
                    $scope.keyLights = keyLights;

                    $scope.hasKeylights = true;
                }
            });

        $scope.isLightSelected = function(light) {
            return $scope.effect.selectedLights[light.name] != null;
        };

        $scope.selectLight = function(light) {
            if ($scope.isLightSelected(light)) {
                delete $scope.effect.selectedLights[light.name];
            } else {
                $scope.effect.selectedLights[light.name] = {
                    light: light,
                    options: {}
                };
            }
        };

        $scope.isOptionSelected = function(option, light) {
            if (!$scope.isLightSelected(light)) {
                return false;
            }
            return $scope.effect.selectedLights[light.name].options[option] != null;
        };

        $scope.selectOption = function(option, light) {
            if ($scope.isOptionSelected(option, light)) {
                delete $scope.effect.selectedLights[light.name].options[option];
            } else {
                $scope.effect.selectedLights[light.name].options[option] = option === "toggleType" ? "toggle" : "";
            }
        };

        $scope.toggleOptions = {
            disable: "無効",
            enable: "有効",
            toggle: "切り替え"
        };
    },
    optionsValidator: (effect) => {
        const errors = [];
        if (Object.keys(effect.selectedLights).length === 0) {
            errors.push("キーライトを選択してください。");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        integration.updateKeyLights(Object.values(event.effect.selectedLights));

        return true;
    }
};

module.exports = effect;
