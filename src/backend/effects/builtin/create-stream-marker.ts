import { EffectType } from "../../../types/effects";
import { EffectCategory } from "../../../shared/effect-constants";
import twitchApi from "../../twitch-api/api";

const model: EffectType<{
    description: string;
}>  = {
    definition: {
        id: "firebot:create-stream-marker",
        name: "ストリームマーカーの作成",
        description: "Twitch VODにストリームマーカーを作成する",
        icon: "fad fa-map-pin",
        categories: [ EffectCategory.COMMON, EffectCategory.TWITCH ],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="Create Stream Marker">
            <firebot-input input-title="Description" model="effect.description" placeholder-text="説明を入力" />
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-warning">
                注：この効果を有効にするには、ライブであり、VODが有効である必要があります。
            </div>
        </eos-container>
    `,
    optionsValidator: () => {
        return [] as string[];
    },
    optionsController: () => {
        
    },
    onTriggerEvent: async ({ effect }) => {
        await twitchApi.streams.createStreamMarker(effect.description);
    }
}

module.exports = model;