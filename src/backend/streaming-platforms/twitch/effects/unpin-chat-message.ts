import type { EffectType } from "../../../../types";
import { TwitchApi } from "../api";
import { LoggerCache } from "../../../logger-cache";

const logger = LoggerCache.getLogger("Effects");

const effect: EffectType = {
    definition: {
        id: "firebot:unpin-chat-message",
        name: "チャットメッセージのピン留め解除",
        description: "現在ピン留めされているチャットメッセージのピン留めを解除します",
        icon: "fas fa-comment-slash",
        categories: ["chat based", "advanced", "twitch"],
        dependencies: ["chat"]
    },
    optionsTemplate: `
        <eos-container>
            <p>この演出は、チャットの上部に現在ピン留めされているチャットメッセージのピン留めを解除します</p>
        </eos-container>
    `,
    onTriggerEvent: async () => {
        const pinnedMessage = await TwitchApi.chat.getPinnedChatMessage();

        if (pinnedMessage?.messageId) {
            await TwitchApi.chat.unpinChatMessage(pinnedMessage.messageId);
        } else {
            logger.warn("No pinned message to unpin");
            return false;
        }

        return true;
    }
};

export = effect;