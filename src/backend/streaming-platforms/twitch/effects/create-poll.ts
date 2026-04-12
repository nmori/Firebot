import type { EffectType } from "../../../../types/effects";
import { TwitchApi } from "../api";
import logger from "../../../logwrapper";

const model: EffectType<{
    title: string;
    choices: string[];
    duration: number;
    allowChannelPointVoting: boolean;
    channelPointsPerVote: number;
}> = {
    definition: {
        id: "twitch:create-poll",
        name: "Twitch 投票作成",
        description: "Twitch の投票を作成します",
        icon: "fad fa-poll-h",
        categories: ["common", "twitch"],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container header="投票タイトル">
            <firebot-input input-title="タイトル" model="effect.title" placeholder-text="投票タイトルを入力" menu-position="under" />
            <div class="effect-info alert alert-warning" ng-if="doesTitleUseAVariable(effect)">
                警告: 変数展開後のタイトルは 60 文字以内にしてください。
            </div>
            <div class="effect-info alert alert-danger" ng-if="doesTitleExceedLength(effect)">
                エラー: タイトルは 60 文字以内にしてください（{{effect.title.length}}/60）。
            </div>
        </eos-container>

        <eos-container header="投票時間" pad-top="true">
            <firebot-input input-title="時間" input-type="number" disable-variables="true" model="effect.duration" placeholder-text="秒数を入力" />
        </eos-container>

        <eos-container header="チャンネルポイント投票" pad-top="true">
            <firebot-checkbox model="effect.allowChannelPointVoting" label="チャンネルポイント投票を有効化" />
            <firebot-input ng-if="effect.allowChannelPointVoting" input-title="1 票あたりのチャンネルポイント" input-type="number" disable-variables="true" model="effect.channelPointsPerVote" placeholder-text="1 票あたりのポイントを入力" />
        </eos-container>

        <eos-container header="選択肢" pad-top="true">
            <div class="effect-info alert alert-warning" ng-if="doAnyChoicesUseAVariable(effect)">
                警告: 変数展開後の各選択肢は 1 〜 25 文字にしてください。
            </div>
            <editable-list settings="optionSettings" model="effect.choices" />
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-warning">
                注意: 同時に実行できる投票は 1 つまでです。
            </div>
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (!effect.title?.length || effect.title.length === 0) {
            errors.push("タイトルを入力してください");
        }

        if (effect.title && effect.title.length > 60 && !effect.title.includes("$")) {
            errors.push("タイトルは 1 〜 60 文字で入力してください");
        }

        if (!(effect.duration >= 15 && effect.duration <= 1800)) {
            errors.push("時間は 15 〜 1800 秒で入力してください");
        }

        if (!effect.choices?.length || !(effect.choices.length >= 2 && effect.choices.length <= 5)) {
            errors.push("選択肢は 2 〜 5 個入力してください");
        }

        if (effect.choices && effect.choices.some(choice => !choice || choice === "" || (choice.length > 25 && !choice.includes("$")))) {
            errors.push("各選択肢は 1 〜 25 文字で入力してください");
        }

        if (
            effect.allowChannelPointVoting &&
            !(effect.channelPointsPerVote >= 1 && effect.channelPointsPerVote <= 1000000)
        ) {
            errors.push("1 票あたりのチャンネルポイントは 1 〜 1,000,000 にしてください");
        }

        return errors;
    },
    optionsController: ($scope) => {
        $scope.optionSettings = {
            addLabel: "選択肢を追加",
            editLabel: "選択肢を編集",
            inputPlaceholder: "選択肢を入力",
            maxItems: 5,
            noDuplicates: true,
            showCopyButton: true,
            showIndex: true,
            sortable: true,
            trigger: $scope.trigger,
            triggerMeta: $scope.triggerMeta,
            customValidators: [
                (choice: string) => {
                    if (choice && choice.length > 25 && !choice.includes("$")) {
                        return {
                            success: false,
                            reason: `選択肢は 25 文字以内にしてください（${choice.length}/25）`
                        };
                    }
                    return true;
                }
            ]
        };

        $scope.doAnyChoicesUseAVariable = (effect) => {
            return effect?.choices && effect.choices.length && effect.choices.some(choice => choice.includes("$"));
        };

        $scope.doesTitleUseAVariable = (effect) => {
            return effect?.title && effect.title.includes("$");
        };
        $scope.doesTitleExceedLength = (effect) => {
            return effect?.title && !effect.title.includes("$") && effect.title.length > 60;
        };
    },
    onTriggerEvent: async ({ effect }) => {
        if (!effect.title.length || effect.title.length < 1 || effect.title.length > 60) {
            logger.error(`Unable to create poll. Poll title "${effect.title}" must be between 1 and 60 characters.`);
            return false;
        }

        effect.choices.forEach((c) => {
            if (!c.length || c.length < 1 || c.length > 25) {
                logger.error(`Unable to create poll. Poll choice "${c}" must be between 1 and 25 characters.`);
                return false;
            }
        });

        logger.debug(`Creating Twitch poll "${effect.title}"`);
        return await TwitchApi.polls.createPoll(
            effect.title,
            effect.choices,
            effect.duration,
            effect.allowChannelPointVoting ? effect.channelPointsPerVote : null
        );
    }
};

export = model;
