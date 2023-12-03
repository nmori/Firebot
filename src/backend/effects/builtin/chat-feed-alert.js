"use strict";

const { EffectCategory, EffectDependency } = require('../../../shared/effect-constants');

const effect = {
    definition: {
        id: "firebot:chat-feed-alert",
        name: "チャットフィード警告",
        description: "Firebotのチャットフィードにアラートを表示する",
        icon: "fad fa-comment-exclamation",
        categories: [EffectCategory.COMMON, EffectCategory.CHAT_BASED],
        dependencies: [EffectDependency.CHAT]
    },
    optionsTemplate: `
    <eos-container>
        <p>このエフェクトを使うと、実際のチャットメッセージを使わずにFirebotのチャットフィードにアラートを送ることができます。つまり、アラートはあなただけに表示されます。</p>
    </eos-container>
    <eos-container header="アラート" pad-top="true">
        <textarea ng-model="effect.message" class="form-control" name="text" placeholder="Enter message" rows="4" cols="40" replace-variables></textarea>
    </eos-container>

    `,
    optionsController: () => {},
    optionsValidator: effect => {
        const errors = [];
        if (effect.message == null || effect.message === "") {
            errors.push("アラートメッセージは空白にはできません");
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
