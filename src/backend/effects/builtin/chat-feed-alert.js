"use strict";

const { EffectCategory, EffectDependency } = require('../../../shared/effect-constants');
const frontendCommunicator = require('../../common/frontend-communicator');

const effect = {
    definition: {
        id: "firebot:chat-feed-alert",
        name: "チャットアラート",
        description: "Firebotのチャットフィードにアラートを表示する",
        icon: "fad fa-comment-exclamation",
        categories: [EffectCategory.COMMON, EffectCategory.CHAT_BASED],
        dependencies: [EffectDependency.CHAT]
    },
    optionsTemplate: `
    <eos-container>
        <p>この演出を使うと、実際のチャットメッセージを使わずにFirebotのチャットフィードにアラートを送ることができます。つまり、アラートはあなただけに表示されます。</p>
    </eos-container>
    <eos-container header="アラート" pad-top="true">
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
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.message == null || effect.message === "") {
            errors.push("アラートメッセージは空白にはできません");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {

        const { effect } = event;

        frontendCommunicator.send("chatUpdate", {
            fbEvent: "ChatAlert",
            message: effect.message
        });

        return true;
    }
};

module.exports = effect;
