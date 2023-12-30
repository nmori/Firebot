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
        name: "�`�����l�����T�����̏��F/����",
        description: "�ۗ�����Twitch�`�����l�����T�̌��������F�܂��͋��ۂ��܂��B",
        icon: "fad fa-check-circle",
        categories: [EffectCategory.COMMON, EffectCategory.TWITCH],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container header="���T">
            <firebot-input input-title="���TID" model="effect.rewardId" placeholder-text="ID�����" />
        </eos-container>

        <eos-container header="��������" pad-top="true">
            <firebot-input input-title="��������ID" model="effect.redemptionId" placeholder-text="ID�����" />
        </eos-container>

        <eos-container header="Action" pad-top="true">
            <div class="btn-group">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="list-effect-type">{{effect.approve != null ? (effect.approve === true ? 'Approve' : 'Reject') : 'Pick One'}}</span> <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                    <li ng-click="effect.approve = true">
                        <a href>���F</a>
                    </li>
                    <li ng-click="effect.approve = false">
                        <a href>�p��</a>
                    </li>
                </ul>
            </div>
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-warning">
                ���FFirebot�ō쐬���ꂽ�`�����l�����T�̌����̂ݏ��F/���ۂ��邱�Ƃ��ł��܂��B
            </div>
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (!effect.rewardId?.length) {
            errors.push("���TID����͂���K�v������܂�");
        } else if (!effect.redemptionId?.length) {
            errors.push("��������ID����͂���K�v������܂�");
        } else if (effect.approve == null) {
            errors.push("�A�N�V������I��ł�������");
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
