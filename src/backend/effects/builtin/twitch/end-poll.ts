import { EffectType } from "../../../../types/effects";
import { EffectCategory } from "../../../../shared/effect-constants";
import logger from "../../../logwrapper";
import twitchApi from "../../../twitch-api/api";

const model: EffectType<{
    archivePoll: boolean;
}> = {
    definition: {
        id: "twitch:end-poll",
        name: "Twitch投票終了",
        description: "現在アクティブなTwitch投票を終了する",
        icon: "fad fa-stop-circle",
        categories: [EffectCategory.COMMON, EffectCategory.TWITCH],
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
        const latestPoll = await twitchApi.polls.getMostRecentPoll();

        if (latestPoll?.status !== "ACTIVE") {
            logger.warn("There is no active Twitch poll to end");
            return;
        }

        logger.debug(`Ending Twitch poll "${latestPoll.title}"${effect.archivePoll ? " as archived" : ""}`);
        return await twitchApi.polls.endPoll(latestPoll.id, effect.archivePoll);
    }
};

module.exports = model;
