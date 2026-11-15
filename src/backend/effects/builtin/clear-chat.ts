import type { EffectType } from "../../../types";

import { TwitchApi } from "../../streaming-platforms/twitch/api";
import { LoggerCache } from "../../logger-cache";

const logger = LoggerCache.getLogger("Effects");

const effect: EffectType = {
    definition: {
        id: "firebot:clearchat",
        name: "チャット全削除",
        description: "すべてのチャットメッセージを削除します。",
        icon: "fad fa-eraser",
        categories: ["common", "moderation", "twitch", "chat based"],
        dependencies: ["chat"]
    },
    optionsTemplate: `
        <eos-container>
            <p>この演出は、Twitch の /clear コマンドと同様に、チャットのメッセージをすべて消去します。</p>
        </eos-container>
    `,
    optionsController: () => {},
    optionsValidator: () => [],
    onTriggerEvent: async () => {
        await TwitchApi.chat.clearChat();
        logger.debug("Chat was cleared via the clear chat effect.");
        return true;
    }
};

export = effect;