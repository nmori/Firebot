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
        name: "チャンネル特典交換の承認/拒否",
        description: "保留中のTwitchチャンネル特典の交換を承認または拒否します。",
        icon: "fad fa-check-circle",
        categories: [EffectCategory.COMMON, EffectCategory.TWITCH],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container header="特典">
<<<<<<< HEAD
            <firebot-input input-title="特典ID" model="effect.rewardId" placeholder-text="IDを入力" />
        </eos-container>

        <eos-container header="引き換え" pad-top="true">
            <firebot-input input-title="引き換えID" model="effect.redemptionId" placeholder-text="IDを入力" />
=======
            <firebot-radio-container>
                <firebot-radio label="Use current reward" model="effect.rewardMode" value="'current'" tooltip="この演出を起動した特典を使用する" />
                <firebot-radio label="Custom" model="effect.rewardMode" value="'custom'" />
                <firebot-input ng-if="effect.rewardMode === 'custom'" input-title="Reward ID" model="effect.rewardId" placeholder-text="IDを入力" menu-position="below" />
            </firebot-radio-container>
        </eos-container>

        <eos-container header="引き換え" pad-top="true">
            <firebot-radio label="現在の交換を利用する" model="effect.redemptionMode" value="'current'" tooltip="この演出を起動した特典を使用する" />
            <firebot-radio label="Custom" model="effect.redemptionMode" value="'custom'" />
            <firebot-input ng-if="effect.redemptionMode === 'custom'" input-title="交換ID" model="effect.redemptionId" placeholder-text="IDを入力" />
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        </eos-container>

        <eos-container header="Action" pad-top="true">
            <div class="btn-group">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="list-effect-type">{{effect.approve != null ? (effect.approve === true ? 'Approve' : 'Reject') : 'Pick One'}}</span> <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                    <li ng-click="effect.approve = true">
                        <a href>承認</a>
                    </li>
                    <li ng-click="effect.approve = false">
                        <a href>却下</a>
                    </li>
                </ul>
            </div>
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-warning">
                注：Firebotで作成されたチャンネル特典の交換のみ承認/拒否することができます。
            </div>
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];

<<<<<<< HEAD
        if (!effect.rewardId?.length) {
            errors.push("特典IDを入力する必要があります");
        } else if (!effect.redemptionId?.length) {
=======
        const rewardMode = effect.rewardMode ?? "custom";
        const redemptionMode = effect.redemptionMode ?? "custom";

        if (rewardMode === "custom" && !effect.rewardId?.length) {
            errors.push("特典IDを入力する必要があります");
        } else if (redemptionMode === "custom" && !effect.redemptionId?.length) {
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
            errors.push("引き換えIDを入力する必要があります");
        } else if (effect.approve == null) {
            errors.push("アクションを選んでください");
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
