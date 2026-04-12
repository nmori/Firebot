import { EffectType } from "../../../../types/effects";
import { EffectCategory } from "../../../../shared/effect-constants";
import logger from "../../../logwrapper";
import twitchApi from "../../../twitch-api/api";

const model: EffectType<{
    title: string;
    choices: string[];
    duration: number;
    allowChannelPointVoting: boolean;
    channelPointsPerVote: number;
}> = {
    definition: {
        id: "twitch:create-poll",
        name: "Twitch謚慕･ｨ繧剃ｽ懈・縺吶ｋ",
        description: "Twitch謚慕･ｨ繧剃ｽ懈・縺吶ｋ",
        icon: "fad fa-poll-h",
        categories: [EffectCategory.COMMON, EffectCategory.TWITCH],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container header="謚慕･ｨ繧ｿ繧､繝医Ν">
            <firebot-input input-title="Title" model="effect.title" placeholder-text="謚慕･ｨ繧ｿ繧､繝医Ν繧貞・繧後ｋ"  menu-position="under" />
            <div class="effect-info alert alert-warning" ng-if="doesTitleUseAVariable(effect)">
                Warning: Title must be shorter than 60 characters after variable expansion.
            </div>
            <div class="effect-info alert alert-danger" ng-if="doesTitleExceedLength(effect)">
                Error: Title must be shorter than 60 characters ({{effect.title.length}}/60).
            </div>
        </eos-container>

        <eos-container header="謚慕･ｨ譛滄俣" pad-top="true">
            <firebot-input input-title="Duration" input-type="number" disable-variables="true" model="effect.duration" placeholder-text="遘呈焚繧貞・繧後ｋ" />
        </eos-container>

        <eos-container header="繝√Ε繝ｳ繝阪Ν繝昴う繝ｳ繝域兜逾ｨ" pad-top="true">
            <firebot-checkbox model="effect.allowChannelPointVoting" label="繝√Ε繝ｳ繝阪Ν繝昴う繝ｳ繝域兜逾ｨ繧定ｨｱ蜿ｯ縺吶ｋ" />
            <firebot-input ng-if="effect.allowChannelPointVoting" input-title="1逾ｨ縺ゅ◆繧翫・繝√Ε繝ｳ繝阪Ν繝ｻ繝昴う繝ｳ繝・ input-type="number" disable-variables="true" model="effect.channelPointsPerVote" placeholder-text="繝√Ε繝ｳ繝阪Ν繝昴う繝ｳ繝域焚繧貞・蜉・ />
        </eos-container>

        <eos-container header="驕ｸ謚櫁い" pad-top="true">
            <div class="effect-info alert alert-warning" ng-if="doAnyChoicesUseAVariable(effect)">
                Warning: All choices must be between 1 and 25 characters after variable expansion.
            </div>
            <editable-list settings="optionSettings" model="effect.choices" />
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-warning">
                豕ｨ・壻ｸ蠎ｦ縺ｫ螳溯｡後〒縺阪ｋ謚慕･ｨ縺ｯ1縺､縺縺代〒縺吶・            </div>
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (!effect.title?.length || effect.title.length === 0) {
            errors.push("繧ｿ繧､繝医Ν繧貞・繧後※縺上□縺輔＞");
        }

        if (!(effect.duration >= 15 && effect.duration <= 1800)) {
            errors.push("Duration must be between 15 and 1800 seconds");
        }

        if (!effect.choices?.length || !(effect.choices.length >= 2 && effect.choices.length <= 5)) {
            errors.push("You must enter between 2 and 5 choices");
        }

        if (
            effect.allowChannelPointVoting &&
            !(effect.channelPointsPerVote >= 1 && effect.channelPointsPerVote <= 1000000)
        ) {
            errors.push("Channel points per vote must be between 1 and 1,000,000");
        }

        return errors;
    },
    optionsController: ($scope) => {
        $scope.optionSettings = {
            noDuplicates: true,
            maxItems: 5,
            trigger: $scope.trigger,
            triggerMeta: $scope.triggerMeta
        };
    },
    onTriggerEvent: async ({ effect }) => {
        if (!effect.title.length || effect.title.length < 1 || effect.title.length > 60) {
            logger.error(`Unable to create poll. Poll title "${effect.title}" must be between 1 and 60 characters.`);
            return false;
        }

        effect.choices.forEach(c => {
            if (!c.length || c.length < 1 || c.length > 25) {
                logger.error(`Unable to create poll. Poll choice "${c}" must be between 1 and 25 characters.`);
                return false;
            }
        });

        logger.debug(`Creating Twitch poll "${effect.title}"`);
        return await twitchApi.polls.createPoll(
            effect.title,
            effect.choices,
            effect.duration,
            effect.allowChannelPointVoting ? effect.channelPointsPerVote : null
        );
    }
};

module.exports = model;
