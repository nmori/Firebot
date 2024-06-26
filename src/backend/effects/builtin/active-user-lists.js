"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');
const logger = require('../../logwrapper');
const twitchApi = require("../../twitch-api/api");
const activeUserHandler = require("../../chat/chat-listeners/active-user-handler");

const model = {
    definition: {
        id: "firebot:activeUserLists",
        name: "アクティブな視聴者の管理",
        description: "アクティブな視聴者を追加または削除します。",
        icon: "fad fa-users",
        categories: [EffectCategory.COMMON, EffectCategory.MODERATION],
        dependencies: []
    },
    optionsTemplate: `
    <eos-container header="Action" pad-top="true">
        <div class="btn-group">
            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span class="list-effect-type">{{effect.action ? effect.action : 'Pick one'}}</span> <span class="caret"></span>
            </button>
            <ul class="dropdown-menu celebrate-effect-dropdown">
                <li ng-click="effect.action = 'Add User'">
                    <a href>視聴者を追加</a>
                </li>
                <li ng-click="effect.action = 'Remove User'">
                    <a href>視聴者を削除</a>
                </li>
                <li ng-click="effect.action = 'Clear List'">
                    <a href>リストをクリア</a>
                </li>
            </ul>
        </div>
    </eos-container>
    <eos-container header="対象" pad-top="true" ng-show="effect.action != null && effect.action !== 'Clear List'">
        <div class="input-group">
            <span class="input-group-addon" id="username-type">視聴者名</span>
            <input ng-model="effect.username" type="text" class="form-control" id="list-username-setting" aria-describedby="list-username-type" replace-variables>
        </div>
    </eos-container>
    `,
    optionsController: () => {},
    optionsValidator: effect => {
        const errors = [];
        if (effect.action == null || effect.action === "") {
            errors.push("実行するアクションを選択してください");
        }
        if (effect.username == null && effect.action !== "Clear List" || effect.username === "" && effect.action !== "Clear List") {
            errors.push("ユーザ名を入れてください");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const username = event.effect.username;
        if (username == null) {
            logger.debug("Couldn't find username for active user list effect.");
            return true;
        }

        const userId = (await twitchApi.users.getUserByName(event.effect.username)).id;
        if (userId == null) {
            logger.debug("Couldn't get ids for username in active user list effect.");
            return true;
        }

        if (event.effect.action === "Add User") {
            await activeUserHandler.addActiveUser({
                id: userId,
                displayName: username,
                userName: username
            }, false, true);
        } else if (event.effect.action === "Remove User") {
            await activeUserHandler.removeActiveUser(userId);
        } else if (event.effect.action === "Clear List") {
            activeUserHandler.clearAllActiveUsers();
        }

        return true;
    }
};

module.exports = model;
