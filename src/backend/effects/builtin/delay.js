"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');

const model = {
    definition: {
        id: "firebot:delay",
        name: "待ち時間",
        description: "演出間のポーズ",
        icon: "fad fa-stopwatch",
        categories: [EffectCategory.COMMON, EffectCategory.ADVANCED, EffectCategory.SCRIPTING],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container header="継続時間">
            <div class="input-group">
                <input ng-model="effect.delay" type="text" class="form-control" aria-describedby="delay-length-effect-type" type="text" replace-variables="number">
                <span class="input-group-addon" id="delay-length-effect-type">秒</span>
            </div>
        </eos-container>
    `,
    optionsValidator: effect => {
        const errors = [];
        if (effect.delay == null || effect.delay.length < 1) {
            errors.push("待ち時間を入力してください。");
        }
        return errors;
    },
    onTriggerEvent: event => {
        return new Promise(resolve => {
            const { effect } = event;

            // wait for the specified time before resolving.
            setTimeout(() => {
                resolve(true);
            }, effect.delay * 1000);
        });
    }
};

module.exports = model;
