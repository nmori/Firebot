"use strict";

const { EffectCategory, EffectDependency } = require('../../../shared/effect-constants');
const logger = require('../../logwrapper');
const twitchApi = require("../../twitch-api/api");

const model = {
    definition: {
        id: "firebot:modpurge",
        name: "チャット削除",
        description: "ユーザーのチャットメッセージを消去する.",
        icon: "fad fa-comment-slash",
        categories: [EffectCategory.COMMON, EffectCategory.MODERATION, EffectCategory.TWITCH],
        dependencies: [EffectDependency.CHAT]
    },
    optionsTemplate: `
    <eos-container header="Target" pad-top="true">
        <div class="input-group">
            <span class="input-group-addon" id="username-type">視聴者名</span>
            <input ng-model="effect.username" type="text" class="form-control" id="list-username-setting" aria-describedby="list-username-type" replace-variables menu-position="below">
        </div>
    </eos-container>
    `,
    optionsController: () => {},
    optionsValidator: effect => {
        const errors = [];
        if (effect.username == null && effect.username !== "") {
            errors.push("視聴者名を指定してください");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const user = await twitchApi.users.getUserByName(event.effect.username);

        if (user != null) {
            const result = await twitchApi.moderation.timeoutUser(user.id, 1, " Firebotがチャットメッセージを削除しました");

            if (result === true) {
                logger.debug(`${event.effect.username} was purged via the Purge effect.`);
            } else {
                logger.error(`${event.effect.username} was unable to be purged via the Purge effect.`);
                return false;
            }
        } else {
            logger.warn(`User ${event.effect.username} does not exist and could not be purged via the Purge effect.`)
            return false;
        }

        return true;
    }
};

module.exports = model;
