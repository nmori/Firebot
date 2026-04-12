"use strict";

const { EffectCategory, EffectTrigger, EffectDependency } = require('../../../shared/effect-constants');
const twitchChat = require("../../chat/twitch-chat");

const effect = {
    definition: {
        id: "firebot:chat",
        name: "繝√Ε繝・ヨ",
        description: "繝√Ε繝・ヨ繝｡繝・そ繝ｼ繧ｸ繧帝√ｋ",
        icon: "fad fa-comment-lines",
        categories: [EffectCategory.COMMON, EffectCategory.CHAT_BASED, EffectCategory.TWITCH],
        dependencies: [EffectDependency.CHAT]
    },
    optionsTemplate: `
    <eos-chatter-select effect="effect" title="騾∽ｿ｡繧｢繧ｫ繧ｦ繝ｳ繝・></eos-chatter-select>

    <eos-container header="騾∽ｿ｡繝｡繝・そ繝ｼ繧ｸ" pad-top="true">
        <firebot-input
            model="effect.message"
            use-text-area="true"
            placeholder-text="繝｡繝・そ繝ｼ繧ｸ縺ｮ蜈･蜉・
            rows="4"
            cols="40"
            menu-position="under"
        />
        <div style="color: #fb7373;" ng-if="effect.message && effect.message.length > 500">繝√Ε繝・ヨ繝｡繝・そ繝ｼ繧ｸ縺ｯ500譁・ｭ励ｒ雜・∴繧九％縺ｨ縺ｯ縺ｧ縺阪∪縺帙ｓ縲ゅ％縺ｮ繝｡繝・そ繝ｼ繧ｸ縺ｯ縲√☆縺ｹ縺ｦ縺ｮ鄂ｮ謠帛､画焚縺悟・蜉帙＆繧後◆蠕後・聞縺吶℃繧句ｴ蜷医・閾ｪ蜍慕噪縺ｫ隍・焚縺ｮ繝｡繝・そ繝ｼ繧ｸ縺ｫ蛻・牡縺輔ｌ縺ｾ縺吶・/div>
        <div style="display: flex; flex-direction: row; width: 100%; height: 36px; margin: 10px 0 10px; align-items: center;">
            <firebot-checkbox 
                label="'/me'繧剃ｽｿ縺・ 
                tooltip="縺輔＆繧・￥縺ｨ縺阪√メ繝｣繝・ヨ繧偵う繧ｿ繝ｪ繝・け陦ｨ遉ｺ縺励∪縺吶・ 
                model="effect.me"
                style="margin: 0px 15px 0px 0px"
            />
            <firebot-checkbox
                label="縺輔＆繧・￥"
                model="showWhisperInput"
                style="margin: 0px 15px 0px 0px"
                ng-click="effect.whisper = ''"
            />
            <div ng-show="showWhisperInput">
                <firebot-input
                    input-title="To"
                    model="effect.whisper"
                    placeholder-text="螳帛・"
                    force-input="true"
                />
            </div>
        </div>
        <p ng-show="whisper" class="muted" style="font-size:11px;"><b>繝偵Φ繝・</b> 髢｢騾｣縺吶ｋ繝ｦ繝ｼ繧ｶ繝ｼ繧偵＆縺輔ｄ縺上↓縺ｯ縲・b>$user</b>繧偵＆縺輔ｄ縺榊｣ｰ繝輔ぅ繝ｼ繝ｫ繝峨↓蜈･繧後∪縺吶・/p>
        <div ng-hide="effect.whisper">
            <firebot-checkbox 
                label="霑比ｿ｡縺ｨ縺励※騾√ｋ" 
                tooltip="霑比ｿ｡縺ｯ繧ｳ繝槭Φ繝峨∪縺溘・繝√Ε繝・ヨ繝｡繝・そ繝ｼ繧ｸ繧､繝吶Φ繝亥・縺ｧ縺ｮ縺ｿ讖溯・縺励∪縺吶・ 
                model="effect.sendAsReply"
                style="margin: 0px 15px 0px 0px"
            />
        </div>
    </eos-container>

    `,
    optionsController: ($scope) => {
        $scope.showWhisperInput = $scope.effect.whisper != null && $scope.effect.whisper !== '';
    },
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.message == null || effect.message === "") {
            errors.push("繝√Ε繝・ヨ繝｡繝・そ繝ｼ繧ｸ繧堤ｩｺ逋ｽ縺ｫ縺吶ｋ縺薙→縺ｯ縺ｧ縺阪∪縺帙ｓ縲・);
        }
        return errors;
    },
    onTriggerEvent: async ({ effect, trigger}) => {
        let messageId = null;
        if (trigger.type === EffectTrigger.COMMAND) {
            messageId = trigger.metadata.chatMessage.id;
        } else if (trigger.type === EffectTrigger.EVENT) {
            messageId = trigger.metadata.eventData?.chatMessage?.id;
        }

        await twitchChat.sendChatMessage(effect.message, effect.whisper, effect.chatter, !effect.whisper && effect.sendAsReply ? messageId : undefined);

        return true;
    }

};

module.exports = effect;
