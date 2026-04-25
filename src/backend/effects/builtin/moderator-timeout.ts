import type { EffectType } from "../../../types/effects";
import { TwitchApi } from "../../streaming-platforms/twitch/api";
import logger from '../../logwrapper';

const effect: EffectType<{
    username: string;
    time: number;
    reason: string;
}> = {
    definition: {
        id: "firebot:modTimeout",
        name: "タイムアウト",
        description: "ユーザーをタイムアウトします。",
        icon: "fad fa-user-clock",
        categories: ["common", "moderation", "twitch"],
        dependencies: ["chat"]
    },
    optionsTemplate: `
        <eos-container header="対象" pad-top="true">
            <div class="input-group">
                <span class="input-group-addon" id="username-type">ユーザー名</span>
                <input ng-model="effect.username" type="text" class="form-control" id="list-username-setting" aria-describedby="list-username-type" replace-variables menu-position="below">
            </div>
        </eos-container>

        <eos-container header="時間" pad-top="true">
            <div class="input-group">
                <span class="input-group-addon" id="time-type">時間（秒）</span>
                <input ng-model="effect.time" type="text" class="form-control" id="list-username-setting" aria-describedby="list-time-type" placeholder="秒数" replace-variables="number">
            </div>
        </eos-container>

        <eos-container header="理由" pad-top="true">
            <firebot-input
                input-title="理由"
                placeholder-text="Firebot によってタイムアウト"
                model="effect.reason"
            />
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.username == null && effect.username !== "") {
            errors.push("ユーザー名を入力してください。");
        }
        if (effect.time == null && (effect.time.toString() !== "" || effect.time < 0)) {
            errors.push("時間を入力してください。");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect }) => {
        const user = await TwitchApi.users.getUserByName(effect.username);

        if (user != null) {
            const reason = effect.reason?.length ? effect.reason : "Timed out by Firebot";
            const result = await TwitchApi.moderation.timeoutUser(user.id, effect.time, reason);

            if (result === true) {
                logger.debug(`${effect.username} was timed out for ${effect.time}s via the timeout effect.`);
            } else {
                logger.error(`${effect.username} was unable to be timed out for ${effect.time}s via the timeout effect.`);
                return false;
            }
        } else {
            logger.warn(`User ${effect.username} does not exist and messages could not be purged via the Purge effect.`);
            return false;
        }

        return true;
    }
};

export = effect;