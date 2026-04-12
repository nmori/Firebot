import type { EffectType } from "../../../../types/effects";
import { TwitchApi } from "../api";

const model: EffectType<{
    description: string;
}> = {
    definition: {
        id: "firebot:create-stream-marker",
        name: "Twitch ストリームマーカー作成",
        description: "Twitch VOD にストリームマーカーを作成します",
        icon: "fad fa-map-pin",
        categories: ["common", "twitch"],
        dependencies: {
            twitch: true
        },
        outputs: [
            {
                label: "ストリームマーカーID",
                description: "新しいストリームマーカーのID",
                defaultName: "streamMarkerId"
            },
            {
                label: "ストリームマーカー位置",
                description: "新しいストリームマーカーの時間（秒）",
                defaultName: "streamMarkerPosition"
            }
        ]
    },
    optionsTemplate: `
        <eos-container header="ストリームマーカー作成">
            <firebot-input input-title="説明" model="effect.description" placeholder-text="説明を入力" menu-position="under" />
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-warning">
                注意: このエフェクトを使うには配信中で、かつ VOD が有効になっている必要があります。
            </div>
        </eos-container>
    `,
    optionsValidator: () => {
        return [] as string[];
    },
    optionsController: () => {},
    onTriggerEvent: async ({ effect }) => {
        const marker = await TwitchApi.streams.createStreamMarker(effect.description);

        return {
            success: !!marker,
            outputs: marker ? {
                streamMarkerId: marker.id,
                streamMarkerPosition: marker.positionInSeconds
            } : null
        };
    }
};

export = model;