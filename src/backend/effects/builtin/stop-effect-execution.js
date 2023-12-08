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
        <eos-container>
            <p>現在の演出リストのうち、演出中のものを実行停止します。</p>

            <div style="margin-top:15px">
                <label class="control-fb control--checkbox"> 親演出リストへ停止演出の実行<tooltip text="'演出の実行停止要求をすべての親演出リストにバブルします (この演出が条件付き演出の中にネストされている場合などに便利です)。'"></tooltip>
                    <input type="checkbox" ng-model="effect.bubbleStop">
                    <div class="control__indicator"></div>
                </label>
            </div>
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
