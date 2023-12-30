import { EffectType } from "../../../../types/effects";
import { EffectCategory } from "../../../../shared/effect-constants";
import twitchApi from "../../../twitch-api/api";

const model: EffectType<{
    adLength: number;
}> = {
    definition: {
        id: "firebot:ad-break",
        name: "Ad Break",
        description: "ad-breakを起動する",
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
                        <a href>30 秒</a>
                    </li>
                    <li ng-click="effect.adLength = 60">
                        <a href>60 秒</a>
                    </li>
                    <li ng-click="effect.adLength = 90">
                        <a href>90 秒</a>
                    </li>
                    <li ng-click="effect.adLength = 120">
                        <a href>120 秒</a>
                    </li>
                    <li ng-click="effect.adLength = 150">
                        <a href>150 秒</a>
                    </li>
                    <li ng-click="effect.adLength = 180">
                        <a href>180 秒</a>
                    </li>
                </ul>
            </div>
        </eos-container>
        <eos-container>
            <div class="effect-info alert alert-warning">
                注：この効果を使用するには、アフィリエイトまたはパートナーである必要があります。
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
