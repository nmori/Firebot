import { EffectType } from "../../../../types/effects";
import { EffectCategory } from "../../../../shared/effect-constants";
import logger from "../../../logwrapper";
import twitchApi from "../../../twitch-api/api";

const model: EffectType = {
    definition: {
        id: "twitch:lock-prediction",
        name: "Twitch予想をロック",
        description: "現在アクティブなTwitch予想をロックし、それ以上予想ができないようにします。",
        icon: "fad fa-lock",
        categories: [EffectCategory.COMMON, EffectCategory.TWITCH],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container>
            <div class="effect-info alert alert-warning">
                注：現在実行中の予想がない場合、これは何のアクションも起こしません。
            </div>
        </eos-container>
    `,
    optionsValidator: () => [],
    optionsController: () => {},
    onTriggerEvent: async () => {
        const latestPrediction = await twitchApi.predictions.getMostRecentPrediction();

        if (latestPrediction?.status !== "ACTIVE") {
            logger.warn("There is no active Twitch prediction to lock");
            return;
        }

        logger.debug(`Locking Twitch prediction "${latestPrediction.title}"`);
        return await twitchApi.predictions.lockPrediciton(latestPrediction.id);
    }
};

module.exports = model;
