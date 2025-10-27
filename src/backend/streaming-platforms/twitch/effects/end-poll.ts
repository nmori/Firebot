import type { EffectType } from "../../../../types/effects";
import { TwitchApi } from "../api";
import logger from "../../../logwrapper";

const model: EffectType<{
    archivePoll: boolean;
}> = {
    definition: {
        id: "twitch:end-poll",
        name: "Twitch投票終了",
        description: "現在アクティブなTwitch投票を終了する",
        icon: "fad fa-stop-circle",
        categories: ["common", "twitch"],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container header="アーカイブ">
            <firebot-checkbox model="effect.archivePoll" label="投票終了後、保存（非表示）" />
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-warning">
                注：現在実行中の投票がない場合、これは何もしません。
            </div>
        </eos-container>
    `,
    optionsValidator: () => [],
    optionsController: () => {},
    onTriggerEvent: async ({ effect }) => {
        const latestPoll = await TwitchApi.polls.getMostRecentPoll();

        if (latestPoll?.status !== "ACTIVE") {
            logger.warn("There is no active Twitch poll to end");
            return;
        }

        logger.debug(`Ending Twitch poll "${latestPoll.title}"${effect.archivePoll ? " as archived" : ""}`);
        return await TwitchApi.polls.endPoll(latestPoll.id, effect.archivePoll);
    }
};

module.exports = model;
