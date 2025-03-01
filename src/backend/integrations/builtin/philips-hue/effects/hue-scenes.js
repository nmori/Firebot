"use strict";

const { EffectCategory } = require("../../../../../shared/effect-constants");
const hueManager = require("../hue-manager");

const effect = {
    definition: {
        id: "hue:scenes",
        name: "Philips Hueシーンを設定",
        description: "Philips Hueのシーンをアクティブにする",
        icon: "far fa-house-signal fa-align-center",
        categories: [EffectCategory.INTEGRATIONS],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container header="Philips Hueシーンを設定">
            <firebot-searchable-select
                items="hueScenes"
                ng-model="effect.sceneId"
                placeholder="シーンを探す..."
                class="mb-2"
            />
        </eos-container>
    `,
    optionsController: ($scope, backendCommunicator) => {
        $scope.hueScenes = [];

        backendCommunicator.fireEventAsync("getAllHueScenes")
            .then((scenes) => {
                $scope.hueScenes = scenes;
            });
    },
    optionsValidator: () => { },
    onTriggerEvent: async ({ effect }) => {
        const sceneId = effect.sceneId;

        hueManager.setHueScene(sceneId);
    }
};

module.exports = effect;