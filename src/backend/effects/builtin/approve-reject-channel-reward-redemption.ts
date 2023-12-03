import { EffectType } from "../../../types/effects";
import { EffectCategory } from "../../../shared/effect-constants";
import twitchApi from "../../twitch-api/api";

const model: EffectType<{
    rewardId: string;
    redemptionId: string;
    approve: boolean;
}>  = {
    definition: {
        id: "firebot:approve-reject-channel-reward-redemption",
        name: "チャンネル報酬交換の承認/拒否",
        description: "保留中のTwitchチャンネル報酬の交換を承認または拒否します。",
        icon: "fad fa-check-circle",
        categories: [ EffectCategory.COMMON, EffectCategory.TWITCH ],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="報酬">
            <firebot-input input-title="報酬ID" model="effect.rewardId" placeholder-text="IDを入力" />
        </eos-container>

        <eos-container header="引き換え" pad-top="true">
            <firebot-input input-title="引き換えID" model="effect.redemptionId" placeholder-text="IDを入力" />
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
                注：Firebotで作成されたチャンネル報酬の償還のみ承認/拒否することができます。
            </div>
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (!effect.rewardId?.length) {
            errors.push("報酬IDを入力する必要があります");
        } else if (!effect.redemptionId?.length) {
            errors.push("引き換えIDを入力する必要があります");
        } else if (effect.approve == null) {
            errors.push("アクションを選んでください");
        }

        return errors;
    },
    optionsController: () => {
        
    },
    onTriggerEvent: async ({ effect }) => {
        return await twitchApi.channelRewards.approveOrRejectChannelRewardRedemption(
            effect.rewardId,
            effect.redemptionId,
            effect.approve
        );
    }
}

module.exports = model;