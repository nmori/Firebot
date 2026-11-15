import type { EffectType } from "../../../../types/effects";
import channelRewardManager from "../../../channel-rewards/channel-reward-manager";

const model: EffectType<{
    rewardMode?: "custom" | "current";
    rewardId?: string;
    redemptionMode?: "custom" | "current";
    redemptionId?: string;
    approve: boolean;
}> = {
    definition: {
        id: "firebot:approve-reject-channel-reward-redemption",
        name: "チャンネル報酬交換の承認/拒否",
        description: "保留中の Twitch チャンネル報酬交換を承認または拒否します",
        icon: "fad fa-check-circle",
        categories: ["common", "twitch"],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container header="報酬情報">
            <firebot-radio-container>
                <firebot-radio label="現在の報酬を使用" model="effect.rewardMode" value="'current'" tooltip="この演出をトリガーした報酬を使用します" />
                <firebot-radio label="カスタム" model="effect.rewardMode" value="'custom'" />
                <firebot-input ng-if="effect.rewardMode === 'custom'" input-title="報酬 ID" model="effect.rewardId" placeholder-text="報酬 ID を入力" menu-position="below" />
            </firebot-radio-container>
        </eos-container>

        <eos-container header="交換情報" pad-top="true">
            <firebot-radio label="現在の交換を使用" model="effect.redemptionMode" value="'current'" tooltip="この演出をトリガーした交換を使用します" />
            <firebot-radio label="カスタム" model="effect.redemptionMode" value="'custom'" />
            <firebot-input ng-if="effect.redemptionMode === 'custom'" input-title="交換 ID" model="effect.redemptionId" placeholder-text="交換 ID を入力" />
        </eos-container>

        <eos-container header="アクション" pad-top="true">
            <div class="btn-group">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="list-effect-type">{{effect.approve != null ? (effect.approve === true ? '承認' : '拒否') : '選択してください'}}</span> <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                    <li ng-click="effect.approve = true">
                        <a href>承認</a>
                    </li>
                    <li ng-click="effect.approve = false">
                        <a href>拒否</a>
                    </li>
                </ul>
            </div>
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-warning">
                注意: 承認/拒否できるのは、Firebot で作成したチャンネル報酬の交換のみです。
            </div>
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];

        const rewardMode = effect.rewardMode ?? "custom";
        const redemptionMode = effect.redemptionMode ?? "custom";

        if (rewardMode === "custom" && !effect.rewardId?.length) {
            errors.push("報酬 ID を入力してください");
        } else if (redemptionMode === "custom" && !effect.redemptionId?.length) {
            errors.push("交換 ID を入力してください");
        } else if (effect.approve == null) {
            errors.push("アクションを選択してください");
        }

        return errors;
    },
    optionsController: ($scope) => {
        if ($scope.effect.rewardMode == null) {
            $scope.effect.rewardMode = "custom";
        }
        if ($scope.effect.redemptionMode == null) {
            $scope.effect.redemptionMode = "custom";
        }
    },
    onTriggerEvent: async ({ effect, trigger }) => {

        const rewardMode = effect.rewardMode ?? "custom";
        const redemptionMode = effect.redemptionMode ?? "custom";

        const rewardId = (rewardMode === "custom" ?
            effect.rewardId :
            trigger.metadata.eventData ?
                trigger.metadata.eventData.rewardId :
                trigger.metadata.rewardId) as string;

        const redemptionId = (redemptionMode === "custom" ?
            effect.redemptionId :
            trigger.metadata.eventData ?
                trigger.metadata.eventData.redemptionId :
                trigger.metadata.redemptionId) as string;

        if (!rewardId || !redemptionId) {
            return;
        }

        return await channelRewardManager.approveOrRejectChannelRewardRedemptions({
            rewardId: rewardId,
            redemptionIds: [redemptionId],
            approve: effect.approve
        });
    }
};

export = model;
