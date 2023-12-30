import { EffectType } from "../../../../types/effects";
import { EffectCategory } from "../../../../shared/effect-constants";
import twitchApi from "../../../twitch-api/api";

const model: EffectType<{
    adLength: number;
}> = {
    definition: {
        id: "firebot:ad-break",
        name: "Ad Break",
        description: "ad-break���N������",
        hidden: !accountAccess.getAccounts().streamer.loggedIn,
        icon: "fad fa-ad",
        categories: [EffectCategory.COMMON, EffectCategory.MODERATION, EffectCategory.TWITCH],
        dependencies: [EffectDependency.CHAT]
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container header="Ad Duration" pad-top="true">
            <div class="btn-group">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="ad-effect-type">{{effect.adLength ? effect.adLength : 'Pick one'}}</span> <span class="caret"></span>
                </button>
                <ul class="dropdown-menu ad-effect-dropdown">
                    <li ng-click="effect.adLength = 30">
                        <a href>30 �b</a>
                    </li>
                    <li ng-click="effect.adLength = 60">
                        <a href>60 �b</a>
                    </li>
                    <li ng-click="effect.adLength = 90">
                        <a href>90 �b</a>
                    </li>
                    <li ng-click="effect.adLength = 120">
                        <a href>120 �b</a>
                    </li>
                    <li ng-click="effect.adLength = 150">
                        <a href>150 �b</a>
                    </li>
                    <li ng-click="effect.adLength = 180">
                        <a href>180 �b</a>
                    </li>
                </ul>
            </div>
        </eos-container>
        <eos-container>
            <div class="effect-info alert alert-warning">
                ���F���̌��ʂ��g�p����ɂ́A�A�t�B���G�C�g�܂��̓p�[�g�i�[�ł���K�v������܂��B
            </div>
        </eos-container>
    `,
    optionsController: () => {},
    optionsValidator: () => {
        return [];
    },
    onTriggerEvent: async (event) => {
        let adLength = event.effect.adLength;

        if (adLength == null) {
            adLength = 30;
        }

        await twitchApi.channels.triggerAdBreak(adLength);
        return true;
    }
};

module.exports = model;
