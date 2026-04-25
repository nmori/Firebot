import type { EffectType } from "../../../types/effects";
import { TwitchApi } from "../../streaming-platforms/twitch/api";
import logger from '../../logwrapper';

const effect: EffectType<{
    action: "Mod" | "Unmod";
    username: string;
}> = {
    definition: {
        id: "firebot:modmod",
        name: "モデレーター付与",
        description: "ユーザーにモデレーター権限を付与または解除します",
        icon: "fad fa-crown",
        categories: ["common", "moderation", "twitch"],
        dependencies: ["chat"]
    },
    optionsTemplate: `
    <eos-container header="操作" pad-top="true">
        <div class="btn-group">
            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span class="list-effect-type">{{effect.action ? (effect.action === 'Mod' ? '付与' : '解除') : '選択してください'}}</span> <span class="caret"></span>
            </button>
            <ul class="dropdown-menu celebrate-effect-dropdown">
                <li ng-click="effect.action = 'Mod'">
                    <a href>付与</a>
                </li>
                <li ng-click="effect.action = 'Unmod'">
                    <a href>解除</a>
                </li>
            </ul>
        </div>
    </eos-container>
    <eos-container header="対象" pad-top="true" ng-show="effect.action != null">
        <div class="input-group">
            <span class="input-group-addon" id="username-type">ユーザー名</span>
            <input ng-model="effect.username" type="text" class="form-control" id="list-username-setting" aria-describedby="list-username-type" replace-variables>
        </div>
    </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.action == null) {
            errors.push("操作を選択してください。");
        }
        if (effect.username == null && effect.username !== "") {
            errors.push("ユーザー名を入力してください。");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect }) => {
        if (effect.action === "Mod") {
            const user = await TwitchApi.users.getUserByName(effect.username);

            if (user != null) {
                const result = await TwitchApi.moderation.addChannelModerator(user.id);

                if (result === true) {
                    logger.debug(`${effect.username} was modded via the Mod effect.`);
                } else {
                    logger.error(`${effect.username} was unable to be modded via the Mod effect.`);
                }
            } else {
                logger.warn(`User ${effect.username} does not exist and could not be modded via the Mod effect`);
            }
        } else if (effect.action === "Unmod") {
            const user = await TwitchApi.users.getUserByName(effect.username);

            if (user != null) {
                const result = await TwitchApi.moderation.removeChannelModerator(user.id);

                if (result === true) {
                    logger.debug(`${effect.username} was unmodded via the Mod effect.`);
                } else {
                    logger.error(`${effect.username} was unable to be unmodded via the Mod effect.`);
                }
            } else {
                logger.warn(`User ${effect.username} does not exist and could not be unmodded via the Mod effect`);
            }
        }

        return true;
    }
};

export = effect;