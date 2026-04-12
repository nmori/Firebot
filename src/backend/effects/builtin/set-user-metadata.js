"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');

const effect = {
    definition: {
        id: "firebot:set-user-metadata",
        name: "繝ｦ繝ｼ繧ｶ縺ｮ繝｡繧ｿ繝・・繧ｿ繧定ｨｭ螳・,
        description: "謖・ｮ壹＠縺溘Θ繝ｼ繧ｶ繝ｼ縺ｫ髢｢騾｣縺吶ｋ繝｡繧ｿ繝・・繧ｿ繧剃ｿ晏ｭ倥☆繧・,
        icon: "fad fa-user-cog",
        categories: [EffectCategory.ADVANCED, EffectCategory.SCRIPTING],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container header="繝ｦ繝ｼ繧ｶ蜷・>
            <input type="text" class="form-control" aria-describedby="basic-addon3" ng-model="effect.username" placeholder="蜷榊燕繧貞・繧後ｋ" replace-variables menu-position="below" />
        </eos-container>

        <eos-container header="繝｡繧ｿ繝・・繧ｿ縺ｮ繧ｭ繝ｼ蜷・ pad-top="true">
            <p class="muted">縺薙・繧ｭ繝ｼ縺ｯ縲・userMetadata縺ｮ鄂ｮ謠帙ヵ繝ｬ繝ｼ繧ｺ繧剃ｽｿ縺｣縺ｦ縲∽ｻ悶・蝣ｴ謇縺ｧ蜿ら・縺吶ｋ縺ｨ縺阪↓菴ｿ縺・∪縺吶・</p>
            <input ng-model="effect.key" type="text" class="form-control" id="chat-text-setting" placeholder="繧ｭ繝ｼ繧貞・繧後ｋ" replace-variables>
        </eos-container>

        <eos-container header="Data" pad-top="true">
            <p class="muted">This is the data that will be saved under the above key in the user's data. Can be text or another replace phrase.</p>
            <selectable-input-editors
                editors="editors"
                initial-editor-label="initialEditorLabel"
                model="effect.data"
            />
            <p class="muted" style="font-size: 11px;"><b>Note:</b> If data is a valid JSON string, it will be parsed into an object or array.</p>

            <div style="margin-top: 10px;">
                <eos-collapsable-panel show-label="蠢懃畑" hide-label="蠢懃畑繧帝國縺・ hide-info-box="true">
                    <h4>繝励Ο繝代ユ繧｣縺ｮ繝代せ (莉ｻ諢・</h4>
                    <p class="muted">繝｡繧ｿ繝・・繧ｿ繝ｻ繧ｭ繝ｼ縺後☆縺ｧ縺ｫ繧ｪ繝悶ず繧ｧ繧ｯ繝医∪縺溘・驟榊・縺ｮ蠖｢縺ｧ菫晏ｭ倥＆繧後◆繝・・繧ｿ繧呈戟縺｣縺ｦ縺・ｋ蝣ｴ蜷医∽ｸ願ｨ倥・繝・・繧ｿ縺ｧ譖ｴ譁ｰ縺吶ｋ迚ｹ螳壹・繝励Ο繝代ユ繧｣縺ｾ縺溘・繧､繝ｳ繝・ャ繧ｯ繧ｹ縺ｸ縺ｮ繝代せ・医ラ繝・ヨ險俶ｳ輔ｒ菴ｿ逕ｨ・峨ｒ螳夂ｾｩ縺吶ｋ縺薙→縺後〒縺阪∪縺吶ゆｽ輔ｂ謖・ｮ壹＠縺ｪ縺・ｴ蜷医・縲√Γ繧ｿ繝・・繧ｿ繧ｨ繝ｳ繝医Μ蜈ｨ菴薙′鄂ｮ縺肴鋤縺医ｉ繧後∪縺吶よ里蟄倥・繝・・繧ｿ縺後↑縺上√・繝ｭ繝代ユ繧｣縺ｮ繝代せ縺梧欠螳壹＆繧後◆蝣ｴ蜷医・縲∽ｽ輔ｂ襍ｷ縺薙ｊ縺ｾ縺帙ｓ縲・p>
                    <eos-collapsable-panel show-label="菴ｿ逕ｨ萓九ｒ陦ｨ遉ｺ" hide-label="菴ｿ逕ｨ萓九ｒ髫縺・ hide-info-box="true">
                        <span>萓・</span>
                        <ul>
                            <li>some.property</li>
                            <li>1</li>
                            <li>1.value</li>
                        </ul>
                    </eos-collapsable-panel>
                    <input ng-model="effect.propertyPath" type="text" class="form-control" id="propertyPath" placeholder="繝代せ繧貞・蜉・ replace-variables>
                </eos-collapsable-panel>
            </div>
        </eos-container>
    `,
    optionsController: () => {},
    optionsValidator: effect => {
        const errors = [];
        if (effect.username == null || effect.username === "") {
            errors.push("繝ｦ繝ｼ繧ｶ蜷阪ｒ蜈･繧後※縺上□縺輔＞.");
        }
        if (effect.key == null || effect.key === "") {
            errors.push("繧ｭ繝ｼ蜷阪ｒ蜈･繧後※縺上□縺輔＞");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const { effect } = event;
        const { username, key, data, propertyPath } = effect;

        const userDb = require("../../database/userDatabase");

        await userDb.updateUserMetadata(username, key, data, propertyPath);

        return true;
    }
};

module.exports = effect;
