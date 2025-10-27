import type { EffectType } from "../../../../types/effects";
import { TwitchApi } from "../api";
import adManager from "../ad-manager";

const model: EffectType = {
    definition: {
        id: "twitch:snooze-ad-break",
        name: "広告の延期依頼",
        description: "差し込み広告を５分延期するよう依頼します",
        icon: "fad fa-snooze",
        categories: [
            "common",
            "Moderation",
            "twitch"
        ],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-container>
            <div class="effect-info alert alert-warning">
            注：この演出を使用するには、アフィリエイトユーザまたはパートナーである必要があります。
            また、Twitchでは広告の延期回数を制限しています。
            短期間に何度も広告を延期依頼した場合、Twitchは延期を承認しません。
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

module.exports = model;