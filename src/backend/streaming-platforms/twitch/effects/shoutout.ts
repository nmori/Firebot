import type { EffectType } from "../../../../types/effects";
import { TwitchApi } from "../api";
import frontendCommunicator from "../../../common/frontend-communicator";
import logger from "../../../logwrapper";

const model: EffectType<{
    username: string;
}> = {
    definition: {
        id: "firebot:twitch-shoutout",
        name: "Twitch シャウトアウト",
        description: "Twitchのシャウトアウトを送る",
        icon: "fad fa-bullhorn",
        categories: ["common", "twitch"],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container header="シャウト対象">
            <firebot-input model="effect.username" placeholder-text="名前を入力" menu-position="below" />
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-warning">
                注意：この演出を使用するには、配信中である必要があります。Twitchの制限により、シャウトアウトを送信できるのは2分に1回、同じユーザーには1時間に1回までとなります。
            </div>
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];
        const username = effect.username?.trim();

        if (!username?.length) {
            errors.push("You must specify a channel to shoutout");
        }

        return errors;
    },
    optionsController: () => {},
    getDefaultLabel: (effect) => {
        return effect.username;
    },
    onTriggerEvent: async ({ effect }) => {
        const targetUserId = (await TwitchApi.users.getUserByName(effect.username))?.id;

        if (targetUserId == null) {
            logger.error(`Unable to shoutout channel. Twitch user ${effect.username} does not exist.`);
            return false;
        }
        const result = await TwitchApi.chat.sendShoutout(targetUserId);
        if (!result.success) {
            frontendCommunicator.send("chatUpdate", {
                fbEvent: "ChatAlert",
                message: result.error
            });
        }
        return result.success;
    }
};

module.exports = model;
