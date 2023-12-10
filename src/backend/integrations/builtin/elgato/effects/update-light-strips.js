"use strict";

const { EffectCategory } = require("../../../../../shared/effect-constants");
const { integration } = require("../elgato");

const effect = {
    definition: {
        id: "elgato:light-strips",
        name: "ライトストリップの更新",
        description: "ライトストリップのオン/オフ、色の変更。",
        icon: "fad fa-lights-holiday fa-align-center",
        categories: [EffectCategory.INTEGRATIONS],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container ng-if="!hasLightStrips">
        現在、ライトストリップは接続されていません。
        </eos-container>
        <eos-container ng-if="hasLightStrips" header="Light Strips">
            <div ng-repeat="light in lightStrips" class="mb-16">
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
                    <label class="control-fb control--checkbox">色の更新
                        <input type="checkbox" ng-click="selectOption('color', light)" ng-checked="isOptionSelected('color', light)" aria-label="..." >
                        <div class="control__indicator"></div>
                    </label>
                    <div ng-if="isOptionSelected('color', light)">
                        <p class="muted">色の値には、16進数のRGB値か、CSS標準のカラー名を指定します。</p>
                    </div>
                    <div class="input-group" ng-if="isOptionSelected('color', light)">
                        <span class="input-group-addon">色 (RGB もしくは 標準カラー名)</span>
                        <input
                            class="form-control"
                            type="text"
                            placeholder="例: RRGGBB / blue"
                            ng-model="effect.selectedLights[light.name].options.color"
                            replace-variables>
                    </div>
                </div>
            </div>
        </eos-container>
    `,
    optionsController: async ($scope, $q, backendCommunicator) => {
        $scope.hasLightStrips = false;
        $scope.lightStrips = [];

        if (!$scope.effect.selectedLights) {
            $scope.effect.selectedLights = {};
        }

        $q.when(backendCommunicator.fireEventAsync("getLightStrips"))
            .then(lightStrips => {
                if (lightStrips?.length > 0) {
                    $scope.lightStrips = lightStrips;

                    $scope.hasLightStrips = true;
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
            errors.push("ライトストリップを選択してください。");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        integration.updateLightStrips(Object.values(event.effect.selectedLights));

        return true;
    }
};

module.exports = effect;
