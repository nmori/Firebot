import { EffectType } from '../../../types/effects';
import { TwitchApi } from '../../streaming-platforms/twitch/api';

const effect: EffectType<{
    chatter: string;
    message: string;
    me: boolean;
    whisper: string;
    sendAsReply: boolean;
}> = {
    definition: {
        id: "firebot:chat",
        name: "チャット",
        description: "チャットメッセージを送る",
        icon: "fad fa-comment-lines",
        categories: ["common", "chat based", "twitch"],
        dependencies: ["chat"]
    },
    optionsTemplate: `
    <eos-chatter-select effect="effect" title="送信アカウント"></eos-chatter-select>

    <eos-container header="送信メッセージ" pad-top="true">
        <firebot-input
            model="effect.message"
            use-text-area="true"
            placeholder-text="メッセージの入力"
            rows="4"
            cols="40"
            menu-position="under"
        />
        <div style="color: #fb7373;" ng-if="effect.message && effect.message.length > 500">チャットメッセージは500文字を超えることはできません。このメッセージは、すべての置換変数が入力された後、長すぎる場合は自動的に複数のメッセージに分割されます。</div>
        <div style="display: flex; flex-direction: row; width: 100%; height: 36px; margin: 10px 0 10px; align-items: center;">
            <firebot-checkbox 
                label="'/me'を使う" 
                tooltip="ささやくとき、チャットをイタリック表示します。" 
                model="effect.me"
                style="margin: 0px 15px 0px 0px"
            />
            <firebot-checkbox
                label="ささやく"
                model="showWhisperInput"
                style="margin: 0px 15px 0px 0px"
                ng-click="effect.whisper = ''"
            />
            <div ng-show="showWhisperInput">
                <firebot-input
                    input-title="To"
                    model="effect.whisper"
                    placeholder-text="宛先"
                    force-input="true"
                />
            </div>
        </div>
        <p ng-show="whisper" class="muted" style="font-size:11px;"><b>ヒント:</b> 関連するユーザーをささやくには、<b>$user</b>をささやき声フィールドに入れます。</p>
        <div ng-hide="effect.whisper">
            <firebot-checkbox 
                label="返信として送る" 
                tooltip="返信はコマンドまたはチャットメッセージイベント内でのみ機能します。" 
                model="effect.sendAsReply"
                style="margin: 0px 15px 0px 0px"
            />
        </div>
    </eos-container>

    `,
    optionsController: ($scope) => {
        $scope.showWhisperInput = $scope.effect.whisper != null && $scope.effect.whisper !== '';
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.message == null || effect.message === "") {
            errors.push("チャットメッセージを空白にすることはできません。");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect, trigger }) => {
        let messageId: string = null;
        if (trigger.type === "command") {
            messageId = trigger.metadata.chatMessage.id;
        } else if (trigger.type === "event") {
            messageId = trigger.metadata.eventData?.chatMessage?.id;
        }

        if (effect.me) {
            effect.message = `/me ${effect.message}`;
        }

        if (effect.whisper) {
            const user = await TwitchApi.users.getUserByName(effect.whisper);
            await TwitchApi.whispers.sendWhisper(user.id, effect.message, effect.chatter.toLowerCase() === "bot");
        } else {
            await TwitchApi.chat.sendChatMessage(effect.message, effect.sendAsReply ? messageId : null, effect.chatter.toLowerCase() === "bot");
        }

        return true;
    }
};

export = effect;