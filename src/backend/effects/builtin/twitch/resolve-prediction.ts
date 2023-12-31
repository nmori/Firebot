import { EffectType } from "../../../../types/effects";
import { EffectCategory } from "../../../../shared/effect-constants";
import logger from "../../../logwrapper";
import twitchApi from "../../../twitch-api/api";

const model: EffectType<{
    outcome: number;
}> = {
    definition: {
        id: "twitch:resolve-prediction",
        name: "Twitch予想を決定",
        description:
            "現在アクティブなTwitch予想の結果を選択することで決定し、勝者にチャンネルポイントを支払う。",
        icon: "fad fa-trophy-alt",
        categories: [EffectCategory.COMMON, EffectCategory.TWITCH],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container header="予想結果">
            <firebot-input model="effect.outcome" input-title="成果" input-type="number" disable-variables="true" placeholder-text="番号" />
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-warning">
                注：現在実行中の予想がない場合、これは何のアクションも起こしません。
            </div>
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (!(effect.outcome >= 1 && effect.outcome <= 10)) {
            errors.push("Outcome must be between 1 and 10.");
        }

        return errors;
    },
    optionsController: () => {},
    onTriggerEvent: async ({ effect }) => {
        const latestPrediction = await twitchApi.predictions.getMostRecentPrediction();

        if (latestPrediction?.status !== "ACTIVE" && latestPrediction?.status !== "LOCKED") {
            logger.warn("There is no active Twitch prediction to resolve");
            return;
        }

        const winningOutcome = latestPrediction.outcomes[effect.outcome - 1];

        logger.debug(`Resolving Twitch prediction "${latestPrediction.title}" with outcome "${winningOutcome.title}"`);
        return await twitchApi.predictions.resolvePrediction(latestPrediction.id, winningOutcome.id);
    }
};

module.exports = model;
