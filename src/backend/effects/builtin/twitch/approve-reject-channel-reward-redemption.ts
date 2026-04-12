import { EffectType } from "../../../../types/effects";
import { EffectCategory } from "../../../../shared/effect-constants";
import twitchApi from "../../../twitch-api/api";

const model: EffectType<{
    rewardId: string;
    redemptionId: string;
    approve: boolean;
}> = {
    definition: {
        id: "firebot:approve-reject-channel-reward-redemption",
        name: "繝√Ε繝ｳ繝阪Ν迚ｹ蜈ｸ莠､謠帙・謇ｿ隱・諡貞凄",
        description: "菫晉蕗荳ｭ縺ｮTwitch繝√Ε繝ｳ繝阪Ν迚ｹ蜈ｸ縺ｮ莠､謠帙ｒ謇ｿ隱阪∪縺溘・諡貞凄縺励∪縺吶・,
        icon: "fad fa-check-circle",
        categories: [EffectCategory.COMMON, EffectCategory.TWITCH],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container header="迚ｹ蜈ｸ">
            <firebot-radio-container>
                <firebot-radio label="Use current reward" model="effect.rewardMode" value="'current'" tooltip="縺薙・貍泌・繧定ｵｷ蜍輔＠縺溽音蜈ｸ繧剃ｽｿ逕ｨ縺吶ｋ" />
                <firebot-radio label="Custom" model="effect.rewardMode" value="'custom'" />
                <firebot-input ng-if="effect.rewardMode === 'custom'" input-title="Reward ID" model="effect.rewardId" placeholder-text="ID繧貞・蜉・ menu-position="below" />
            </firebot-radio-container>
        </eos-container>

        <eos-container header="蠑輔″謠帙∴" pad-top="true">
            <firebot-radio label="迴ｾ蝨ｨ縺ｮ莠､謠帙ｒ蛻ｩ逕ｨ縺吶ｋ" model="effect.redemptionMode" value="'current'" tooltip="縺薙・貍泌・繧定ｵｷ蜍輔＠縺溽音蜈ｸ繧剃ｽｿ逕ｨ縺吶ｋ" />
            <firebot-radio label="Custom" model="effect.redemptionMode" value="'custom'" />
            <firebot-input ng-if="effect.redemptionMode === 'custom'" input-title="莠､謠姜D" model="effect.redemptionId" placeholder-text="ID繧貞・蜉・ />
        </eos-container>

        <eos-container header="Action" pad-top="true">
            <div class="btn-group">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="list-effect-type">{{effect.approve != null ? (effect.approve === true ? 'Approve' : 'Reject') : 'Pick One'}}</span> <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                    <li ng-click="effect.approve = true">
                        <a href>謇ｿ隱・/a>
                    </li>
                    <li ng-click="effect.approve = false">
                        <a href>蜊ｴ荳・/a>
                    </li>
                </ul>
            </div>
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-warning">
                豕ｨ・哥irebot縺ｧ菴懈・縺輔ｌ縺溘メ繝｣繝ｳ繝阪Ν迚ｹ蜈ｸ縺ｮ莠､謠帙・縺ｿ謇ｿ隱・諡貞凄縺吶ｋ縺薙→縺後〒縺阪∪縺吶・            </div>
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];

        const rewardMode = effect.rewardMode ?? "custom";
        const redemptionMode = effect.redemptionMode ?? "custom";

        if (rewardMode === "custom" && !effect.rewardId?.length) {
            errors.push("迚ｹ蜈ｸID繧貞・蜉帙☆繧句ｿ・ｦ√′縺ゅｊ縺ｾ縺・);
        } else if (redemptionMode === "custom" && !effect.redemptionId?.length) {
            errors.push("蠑輔″謠帙∴ID繧貞・蜉帙☆繧句ｿ・ｦ√′縺ゅｊ縺ｾ縺・);
        } else if (effect.approve == null) {
            errors.push("繧｢繧ｯ繧ｷ繝ｧ繝ｳ繧帝∈繧薙〒縺上□縺輔＞");
        }

        return errors;
    },
    optionsController: () => {},
    onTriggerEvent: async ({ effect }) => {
        return await twitchApi.channelRewards.approveOrRejectChannelRewardRedemption(
            effect.rewardId,
            effect.redemptionId,
            effect.approve
        );
    }
};

module.exports = model;
