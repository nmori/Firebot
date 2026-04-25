import { EffectType } from '../../../types/effects';
import { TwitchApi } from "../../streaming-platforms/twitch/api";
import { ActiveUserHandler } from "../../chat/active-user-handler";
import logger from '../../logwrapper';

const effect: EffectType<{
    action: string;
    username: string;
}> = {
    definition: {
        id: "firebot:activeUserLists",
        name: "アクティブチャットユーザー管理",
        description: "アクティブチャットユーザーリストにユーザーを追加・削除します。",
        icon: "fad fa-users",
        categories: ["common", "moderation"],
        dependencies: []
    },
    optionsTemplate: `
    <eos-container header="操作" pad-top="true">
        <div class="btn-group">
            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span class="list-effect-type">{{effect.action ? actionLabel(effect.action) : '選択してください'}}</span> <span class="caret"></span>
            </button>
            <ul class="dropdown-menu celebrate-effect-dropdown">
                <li ng-click="effect.action = 'Add User'">
                    <a href>ユーザー追加</a>
                </li>
                <li ng-click="effect.action = 'Remove User'">
                    <a href>ユーザー削除</a>
                </li>
                <li ng-click="effect.action = 'Clear List'">
                    <a href>リストをクリア</a>
                </li>
            </ul>
        </div>
    </eos-container>
    <eos-container header="対象" pad-top="true" ng-show="effect.action != null && effect.action !== 'Clear List'">
        <div class="input-group">
            <span class="input-group-addon" id="username-type">ユーザー名</span>
            <input ng-model="effect.username" type="text" class="form-control" id="list-username-setting" aria-describedby="list-username-type" replace-variables>
        </div>
    </eos-container>
    `,
    optionsController: ($scope) => {
        $scope.actionLabel = (action: string) => {
            switch (action) {
                case "Add User": return "ユーザー追加";
                case "Remove User": return "ユーザー削除";
                case "Clear List": return "リストをクリア";
                default: return action;
            }
        };
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.action == null || effect.action === "") {
            errors.push("操作を選択してください。");
        }
        if (effect.username == null && effect.action !== "Clear List" || effect.username === "" && effect.action !== "Clear List") {
            errors.push("ユーザー名を入力してください。");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const username = event.effect.username;
        if (username == null) {
            logger.debug("Couldn't find username for active user list effect.");
            return true;
        }

        const userId = (await TwitchApi.users.getUserByName(event.effect.username)).id;
        if (userId == null) {
            logger.debug("Couldn't get ids for username in active user list effect.");
            return true;
        }

        if (event.effect.action === "Add User") {
            await ActiveUserHandler.addActiveUser({
                userId: userId,
                displayName: username,
                userName: username
            }, false, true);
        } else if (event.effect.action === "Remove User") {
            ActiveUserHandler.removeActiveUser(userId);
        } else if (event.effect.action === "Clear List") {
            ActiveUserHandler.clearAllActiveUsers();
        }

        return true;
    }
};

export = effect;