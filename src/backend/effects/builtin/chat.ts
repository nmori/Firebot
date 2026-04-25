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
        name: "チャット送信",
        description: "チャットメッセージを送信します。",
        icon: "fad fa-comment-lines",
        categories: ["common", "chat based", "twitch"],
        dependencies: ["chat"]
    },
    optionsTemplate: `
    <eos-chatter-select effect="effect" title="送信元"></eos-chatter-select>

    <eos-container header="送信するメッセージ" pad-top="true">
        <firebot-input
            model="effect.message"
            use-text-area="true"
            placeholder-text="メッセージを入力"
            rows="4"
            cols="40"
            menu-position="under"
        />
        <div style="color: #fb7373;" ng-if="effect.message && effect.message.length > 500">チャットメッセージは500文字までです。変数を展開した結果が500文字を超えた場合は、自動的に複数のメッセージに分割して送信されます。</div>
        <div style="display: flex; flex-direction: row; width: 100%; height: 36px; margin: 10px 0 10px; align-items: center;">
            <firebot-checkbox
                label="'/me' を使用"
                tooltip="チャットメッセージをイタリック表示にするか、ウィスパーで使用した場合はチャットカラーが変わります。"
                model="effect.me"
                style="margin: 0px 15px 0px 0px"
            />
            <firebot-checkbox
                label="ウィスパー"
                model="showWhisperInput"
                style="margin: 0px 15px 0px 0px"
                ng-click="effect.whisper = ''"
            />
            <div ng-show="showWhisperInput">
                <firebot-input
                    input-title="宛先"
                    model="effect.whisper"
                    placeholder-text="ユーザー名"
                    force-input="true"
                />
            </div>
        </div>
        <p ng-show="effect.whisper" class="muted" style="font-size:11px;"><b>ヒント:</b> 関連ユーザーにウィスパーを送るには、宛先欄に <b>$user</b> と入力してください。</p>
        <div ng-hide="effect.whisper">
            <firebot-checkbox
                label="返信として送信"
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
            errors.push("チャットメッセージを入力してください。");
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

        // We default to sending as the bot unless the user specifies otherwise
        const sendAsBot = (effect.chatter == null || effect.chatter.toLowerCase() === "bot");

        if (effect.whisper) {
            const user = await TwitchApi.users.getUserByName(effect.whisper);
            await TwitchApi.whispers.sendWhisper(user.id, effect.message, sendAsBot);
        } else {
            await TwitchApi.chat.sendChatMessage(effect.message, effect.sendAsReply ? messageId : null, sendAsBot);
        }

        return true;
    }
};

export = effect;