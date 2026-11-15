import type { EffectType } from "../../../../types/effects";
import { TwitchApi } from "../api";
import adManager from "../ad-manager";

const model: EffectType = {
    definition: {
        id: "twitch:snooze-ad-break",
        name: "次の広告ブレイクをスヌーズ",
        description: "次回予定されているミッドロール広告ブレイクを 5 分延期します",
        icon: "fad fa-snooze",
        categories: [
            "common",
            "twitch"
        ],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container>
            <div class="effect-info alert alert-warning">
                注意: この演出を使うには、アフィリエイトまたはパートナーである必要があります。
                また、Twitch ではミッドロール広告をスヌーズできる回数に制限があります。
                短時間に何度もスヌーズした場合、Twitch によって拒否されます。
            </div>
        </eos-container>
    `,
    optionsController: () => {},
    optionsValidator: () => {
        return [];
    },
    onTriggerEvent: async () => {
        const result = await TwitchApi.channels.snoozeAdBreak();

        if (result === true) {
            await adManager.runAdCheck();
        }

        return result;
    }
};

export = model;