"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');

const model = {
    definition: {
        id: "firebot:stop-effect-execution",
        name: "貍泌・縺ｮ螳溯｡悟●豁｢",
        description: "迴ｾ蝨ｨ縺ｮ貍泌・繝ｪ繧ｹ繝医・螳溯｡後ｒ蛛懈ｭ｢縺吶ｋ縲・,
        icon: "fad fa-stop-circle",
        categories: [EffectCategory.SCRIPTING],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container header="Target">
            <firebot-radios
                options="targetOptions"
                model="effect.target"
            />
        </eos-container>

        <eos-container header="Effect List" ng-if="effect.target === 'specificList'" pad-top="true">
            <firebot-input
                input-title="Effect List ID"
                title-tooltip="You can copy the ID of an effect list via its three-dot menu in the top right corner"
                model="effect.listId"
                placeholder-text="Enter ID"
                data-type="text"
            />
        </eos-container>

        <eos-container header="Effect" ng-if="effect.target === 'specificEffect'" pad-top="true">
            <firebot-input
                input-title="Effect ID"
                title-tooltip="You can copy the ID of an effect via its three-dot menu"
                model="effect.effectId"
                placeholder-text="Enter ID"
                data-type="text"
            />
        </eos-container>

        <eos-container header="Queue" ng-if="effect.target === 'queueActiveEffectLists'" pad-top="true">
            <firebot-searchable-select
                ng-model="effect.queueId"
                placeholder="Select queue"
                items="queueOptions"
            />
        </eos-container>

        <eos-container
            header="Options"
            ng-if="effect.target !== 'specificEffect'"
            pad-top="true"
        >
            <firebot-checkbox
                label="Bubble to parent effect lists"
                tooltip="Bubble the stop effect execution request to all parent effect lists (useful if nested within a conditional effect, etc)"
                model="effect.bubbleStop"
            />
        </eos-container>
    `,
    optionsController: () => {},
    optionsValidator: () => {},
    onTriggerEvent: async event => {
        const { effect } = event;
        return {
            success: true,
            execution: {
                stop: true,
                bubbleStop: effect.bubbleStop === true
            }
        };
    }
};

module.exports = model;
