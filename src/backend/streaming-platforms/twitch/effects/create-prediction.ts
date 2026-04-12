import type { EffectType } from "../../../../types/effects";
import { TwitchApi } from "../api";
import logger from "../../../logwrapper";

const model: EffectType<{
    title: string;
    outcomes: string[];
    duration: number;
}> = {
    definition: {
        id: "twitch:create-prediction",
        name: "Twitch 予想作成",
        description: "Twitch の予想を作成します",
        icon: "fad fa-question-circle",
        categories: ["common", "twitch"],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container header="予想タイトル">
            <firebot-input input-title="タイトル" model="effect.title" placeholder-text="予想タイトルを入力" menu-position="under" />
        </eos-container>

        <eos-container header="予想時間" pad-top="true">
            <firebot-input input-title="時間" input-type="number" disable-variables="true" model="effect.duration" placeholder-text="秒数を入力" />
        </eos-container>

        <eos-container header="結果候補" pad-top="true">
            <editable-list settings="optionSettings" model="effect.outcomes" />
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-warning">
                注意: 同時に実行できる予想は 1 つまでです。
            </div>
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (!effect.title?.length || effect.title.length === 0) {
            errors.push("タイトルを入力してください");
        }

        if (!(effect.duration >= 30 && effect.duration <= 1800)) {
            errors.push("時間は 30 〜 1800 秒で入力してください");
        }

        if (!effect.outcomes?.length || !(effect.outcomes.length >= 2 && effect.outcomes.length <= 10)) {
            errors.push("結果候補は 2 〜 10 個入力してください");
        }

        return errors;
    },
    optionsController: ($scope) => {
        $scope.optionSettings = {
            noDuplicates: true,
            maxItems: 10,
            trigger: $scope.trigger,
            triggerMeta: $scope.triggerMeta
        };
    },
    onTriggerEvent: async ({ effect }) => {
        if (!effect.title.length || effect.title.length < 1 || effect.title.length > 45) {
            logger.error(`Unable to create prediction. Prediction title "${effect.title}" must be between 1 and 45 characters.`);
            return false;
        }

        effect.outcomes.forEach((o) => {
            if (!o.length || o.length < 1 || o.length > 25) {
                logger.error(`Unable to create prediction. Prediction outcome "${o}" must be between 1 and 25 characters.`);
                return false;
            }
        });

        logger.debug(`Creating Twitch prediction "${effect.title}"`);
        return await TwitchApi.predictions.createPrediction(effect.title, effect.outcomes, effect.duration);
    }
};

export = model;
