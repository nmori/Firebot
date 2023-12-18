"use strict";

const { EffectCategory, EffectDependency } = require('../../../shared/effect-constants');
const logger = require('../../logwrapper');
const twitchApi = require("../../twitch-api/api");

const model = {
    definition: {
        id: "firebot:modTimeout",
        name: "タイムアウト",
        description: "ユーザのタイムアウトを設定します",
        icon: "fad fa-user-clock",
        categories: [EffectCategory.COMMON, EffectCategory.MODERATION, EffectCategory.TWITCH],
        dependencies: [EffectDependency.CHAT]
    },
    optionsTemplate: `
    <eos-container header="対象" pad-top="true">
        <div class="input-group">
            <span class="input-group-addon" id="username-type">視聴者名</span>
            <input ng-model="effect.username" type="text" class="form-control" id="list-username-setting" aria-describedby="list-username-type" replace-variables menu-position="below">
        </div>
    </eos-container>
    <eos-container header="時間" pad-top="true">
        <div class="input-group">
            <input ng-model="effect.time" type="text" class="form-control" id="list-username-setting" aria-describedby="list-time-type" placeholder="Seconds" replace-variables="number">
            <span class="input-group-addon" id="time-type"> 秒</span>
        </div>
    </eos-container>
    `,
    optionsController: () => {},
    optionsValidator: effect => {
        const errors = [];
        if (effect.username == null && effect.username !== "") {
            errors.push("視聴者名を指定してください");
        }
        if (effect.time == null && (effect.time !== "" || effect.time < 0)) {
            errors.push("時間を指定してください");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const user = await twitchApi.users.getUserByName(event.effect.username);

        if (user != null) {
            const result = await twitchApi.moderation.timeoutUser(user.id, event.effect.time);

            if (result === true) {
                logger.debug(`${event.effect.username} was timed out for ${event.effect.time}s via the timeout effect.`);
            } else {
                logger.error(`${event.effect.username} was unable to be timed out for ${event.effect.time}s via the timeout effect.`);
                return false;
            }
        } else {
            logger.warn(`User ${event.effect.username} does not exist and messages could not be purged via the Purge effect.`)
            return false;
        }

        return true;
    }
};

module.exports = model;
