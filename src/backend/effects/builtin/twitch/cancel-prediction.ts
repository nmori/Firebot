import { EffectType } from "../../../../types/effects";
import { EffectCategory } from "../../../../shared/effect-constants";
import logger from "../../../logwrapper";
import twitchApi from "../../../twitch-api/api";

const model: EffectType = {
    definition: {
        id: "twitch:cancel-prediction",
        name: "Twitch予想をキャンセル",
        description: "現在アクティブなTwitch予想をキャンセルし、賭けられたすべてのチャンネルポイントを払い戻します。",
        icon: "fad fa-ban",
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

        if (latestPrediction?.status !== "ACTIVE" && latestPrediction?.status !== "LOCKED") {
            logger.warn("There is no active Twitch prediction to cancel");
            return;
        }

        logger.debug(`Canceling Twitch prediction "${latestPrediction.title}"`);
        return await twitchApi.predictions.cancelPrediction(latestPrediction.id);
    }
};

module.exports = model;
