"use strict";

const { EffectCategory, EffectDependency } = require('../../../shared/effect-constants');

const effect = {
    definition: {
        id: "firebot:chat-feed-alert",
        name: "繝√Ε繝・ヨ繧｢繝ｩ繝ｼ繝・,
        description: "Firebot縺ｮ繝√Ε繝・ヨ繝輔ぅ繝ｼ繝峨↓繧｢繝ｩ繝ｼ繝医ｒ陦ｨ遉ｺ縺吶ｋ",
        icon: "fad fa-comment-exclamation",
        categories: [EffectCategory.COMMON, EffectCategory.CHAT_BASED],
        dependencies: [EffectDependency.CHAT]
    },
    optionsTemplate: `
    <eos-container>
        <p>縺薙・貍泌・繧剃ｽｿ縺・→縲∝ｮ滄圀縺ｮ繝√Ε繝・ヨ繝｡繝・そ繝ｼ繧ｸ繧剃ｽｿ繧上★縺ｫFirebot縺ｮ繝√Ε繝・ヨ繝輔ぅ繝ｼ繝峨↓繧｢繝ｩ繝ｼ繝医ｒ騾√ｋ縺薙→縺後〒縺阪∪縺吶ゅ▽縺ｾ繧翫√い繝ｩ繝ｼ繝医・縺ゅ↑縺溘□縺代↓陦ｨ遉ｺ縺輔ｌ縺ｾ縺吶・/p>
    </eos-container>
    <eos-container header="繧｢繝ｩ繝ｼ繝・ pad-top="true">
        <firebot-input
            model="effect.message"
            use-text-area="true"
            placeholder-text="Enter message"
            rows="4"
            cols="40"
            menu-position="under"
        />
    </eos-container>

    `,
    optionsController: () => {},
    optionsValidator: effect => {
        const errors = [];
        if (effect.message == null || effect.message === "") {
            errors.push("繧｢繝ｩ繝ｼ繝医Γ繝・そ繝ｼ繧ｸ縺ｯ遨ｺ逋ｽ縺ｫ縺ｯ縺ｧ縺阪∪縺帙ｓ");
        }
        return errors;
    },
    onTriggerEvent: async event => {

        const { effect } = event;

        renderWindow.webContents.send("chatUpdate", {
            fbEvent: "ChatAlert",
            message: effect.message
        });

        return true;
    }
};

module.exports = effect;
