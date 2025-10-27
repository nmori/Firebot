import { EffectType } from '../../../types/effects';
import { TwitchApi } from "../../streaming-platforms/twitch/api";
import logger from '../../logwrapper';

const effect: EffectType = {
    definition: {
        id: "firebot:clearchat",
        name: "チャットクリア",
        description: "すべてのチャットメッセージを消去する",
        icon: "fad fa-eraser",
        categories: ["common", "Moderation", "twitch"],
        dependencies: ["chat"]
    },
    optionsTemplate: `
        <eos-container>
            <p>このエフェクトは、Twitchの /clearコマンドのように、チャットからすべてのチャットメッセージを消去します。</p>
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