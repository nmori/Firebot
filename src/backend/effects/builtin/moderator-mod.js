"use strict";

const { EffectCategory, EffectDependency } = require('../../../shared/effect-constants');
const logger = require('../../logwrapper');
const twitchApi = require("../../twitch-api/api");

const model = {
    definition: {
        id: "firebot:modmod",
        name: "自動管理",
        description: "視聴者に自動管理を設定、もしくは解除します",
        icon: "fad fa-crown",
        categories: [EffectCategory.COMMON, EffectCategory.MODERATION, EffectCategory.TWITCH],
        dependencies: [EffectDependency.CHAT]
    },
    optionsTemplate: `
    <eos-container header="Action" pad-top="true">
        <div class="btn-group">
            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span class="list-effect-type">{{effect.action ? effect.action : 'Pick one'}}</span> <span class="caret"></span>
            </button>
            <ul class="dropdown-menu celebrate-effect-dropdown">
                <li ng-click="effect.action = 'Mod'">
                    <a href>自動管理の設定</a>
                </li>
                <li ng-click="effect.action = 'Unmod'">
                    <a href>自動管理の解除</a>
                </li>
            </ul>
        </div>
    </eos-container>
    <eos-container header="対象" pad-top="true" ng-show="effect.action != null">
        <div class="input-group">
            <span class="input-group-addon" id="username-type">視聴者名</span>
            <input ng-model="effect.username" type="text" class="form-control" id="list-username-setting" aria-describedby="list-username-type" replace-variables>
        </div>
    </eos-container>
    `,
    optionsController: () => {},
    optionsValidator: effect => {
        const errors = [];
        if (effect.action == null) {
            errors.push("アクションを設定してください");
        }
        if (effect.username == null && effect.username !== "") {
            errors.push("視聴者名を指定してください");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        if (event.effect.action === "Mod") {
            const user = await twitchApi.users.getUserByName(event.effect.username);

            if (user != null) {
                const result = await twitchApi.moderation.addChannelModerator(user.id);

                if (result === true) {
                    logger.debug(`${event.effect.username} was modded via the Mod effect.`);
                } else {
                    logger.error(`${event.effect.username} was unable to be modded via the Mod effect.`);
                }
            } else {
                logger.warn(`User ${event.effect.username} does not exist and could not be modded via the Mod effect`);
            }
        } else if (event.effect.action === "Unmod") {
            const user = await twitchApi.users.getUserByName(event.effect.username);

            if (user != null) {
                const result = await twitchApi.moderation.removeChannelModerator(user.id);

                if (result === true) {
                    logger.debug(`${event.effect.username} was unmodded via the Mod effect.`);
                } else {
                    logger.error(`${event.effect.username} was unable to be unmodded via the Mod effect.`);
                }
            } else {
                logger.warn(`User ${event.effect.username} does not exist and could not be unmodded via the Mod effect`);
            }
        }

        return true;
    }
};

module.exports = model;
