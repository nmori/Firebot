import type { EffectType } from "../../../../types/effects";
import { TwitchApi } from "../api";

const model: EffectType<{
    description: string;
}> = {
    definition: {
        id: "firebot:create-stream-marker",
        name: "ストリームマーカーの作成",
        description: "Twitch VODにストリームマーカーを作成する",
        icon: "fad fa-map-pin",
        categories: ["common", "twitch"],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container header="Create Stream Marker">
            <firebot-input input-title="Description" model="effect.description" placeholder-text="説明を入力" menu-position="under" />
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-warning">
                注：この演出を有効にするには、ライブであり、VODが有効である必要があります。
            </div>
        </eos-container>
    `,
    optionsValidator: () => {
        return [] as string[];
    },
    optionsController: () => {},
    onTriggerEvent: async ({ effect }) => {
        await TwitchApi.streams.createStreamMarker(effect.description);
    }
};

module.exports = model;
