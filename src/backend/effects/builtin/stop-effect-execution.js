"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');

const model = {
    definition: {
        id: "firebot:stop-effect-execution",
        name: "演出の実行停止",
        description: "現在の演出リストの実行を停止する。",
        icon: "fad fa-stop-circle",
        categories: [EffectCategory.SCRIPTING],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
<<<<<<< HEAD
        <eos-container>
            <p>現在の演出リストのうち、演出中のものを実行停止します。</p>

            <div style="margin-top:15px">
                <label class="control-fb control--checkbox"> 親演出リストへ停止演出の実行<tooltip text="'演出の実行停止要求をすべての親演出リストにバブルします (この演出が条件付き演出の中にネストされている場合などに便利です)。'"></tooltip>
                    <input type="checkbox" ng-model="effect.bubbleStop">
                    <div class="control__indicator"></div>
                </label>
            </div>
=======
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
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
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
