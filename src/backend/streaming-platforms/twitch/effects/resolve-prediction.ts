import type { EffectType } from "../../../../types/effects";
import { TwitchApi } from "../api";
import logger from "../../../logwrapper";

const model: EffectType<{
    outcome: number;
}> = {
    definition: {
        id: "twitch:resolve-prediction",
        name: "Twitch 予想を確定",
        description:
            "現在進行中の Twitch 予想の結果を選択して確定し、勝者へチャンネルポイントを支払います",
        icon: "fad fa-trophy-alt",
        categories: ["common", "twitch"],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container header="Prediction Outcome">
            <firebot-input model="effect.outcome" input-title="Outcome" input-type="number" disable-variables="true" placeholder-text="Outcome number" />
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-warning">
                Note: If there is no prediction currently running, this will take no action.
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
    getDefaultLabel: (effect) => {
        return `Outcome #${effect.outcome}`;
    },
    onTriggerEvent: async ({ effect }) => {
        const latestPrediction = await TwitchApi.predictions.getMostRecentPrediction();

        if (latestPrediction?.status !== "ACTIVE" && latestPrediction?.status !== "LOCKED") {
            logger.warn("There is no active Twitch prediction to resolve");
            return;
        }

        const winningOutcome = latestPrediction.outcomes[effect.outcome - 1];

        logger.debug(`Resolving Twitch prediction "${latestPrediction.title}" with outcome "${winningOutcome.title}"`);
        return await TwitchApi.predictions.resolvePrediction(latestPrediction.id, winningOutcome.id);
    }
};

export = model;
