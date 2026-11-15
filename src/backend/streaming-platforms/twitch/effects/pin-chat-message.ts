import type { EffectType } from "../../../../types";
import { TwitchApi } from "../api";

const effect: EffectType<{
    pinUntilEndOfStream: boolean;
    pinDuration?: string;
}> = {
    definition: {
        id: "firebot:pin-chat-message",
        name: "チャットメッセージをピン留め",
        description: "関連するチャットメッセージをチャットの上部にピン留めします",
        icon: "fas fa-thumbtack",
        categories: ["chat based", "advanced", "twitch"],
        dependencies: ["chat"],
        triggers: {
            command: true,
            event: ["twitch:chat-message"]
        }
    },
    optionsTemplate: `
        <eos-container>
            <p>この演出は、関連するチャットメッセージ（コマンドまたはチャットメッセージイベントのもの）をチャットの上部にピン留めします</p>
        </eos-container>

        <eos-container header="設定" pad-top="true">
            <firebot-checkbox
                label="配信終了までピン留めする"
                model="effect.pinUntilEndOfStream"
                style="margin: 0px 15px 0px 0px"
            />
            <firebot-input
                ng-show="effect.pinUntilEndOfStream !== true"
                model="effect.pinDuration"
                input-title="期間（秒）"
                placeholder-text="期間を入力"
            />
        </eos-container>
    `,
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.pinUntilEndOfStream !== true
            && !effect.pinDuration?.length
        ) {
            errors.push("ピン留めの期間を指定してください");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect, trigger }) => {
        let messageId: string = null;
        if (trigger.type === "command") {
            messageId = trigger.metadata.chatMessage.id;
        } else if (trigger.type === "event") {
            // if trigger is event, build chat message from chat event data
            messageId = trigger.metadata.eventData.chatMessage.id;
        }

        if (messageId) {
            let pinDuration: number = undefined;

            if (effect.pinUntilEndOfStream !== true && !!effect.pinDuration?.length) {
                pinDuration = Number(effect.pinDuration);

                if (isNaN(pinDuration)) {
                    pinDuration = undefined;
                } else if (pinDuration < 30) {
                    pinDuration = 30;
                } else if (pinDuration > 1800) {
                    pinDuration = 1800;
                }
            }

            await TwitchApi.chat.pinChatMessage(messageId, pinDuration);
        }

        return true;
    }
};

export = effect;