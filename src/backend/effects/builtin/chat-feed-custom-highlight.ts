import { EffectType } from "../../../types/effects";
import { TriggersObject } from '../../../types/triggers';
import frontendCommunicator from "../../common/frontend-communicator";
import logger from "../../logwrapper";

const triggers: TriggersObject = {};
triggers["command"] = true;
triggers["event"] = ["twitch:chat-message", "twitch:viewer-arrived", "firebot:highlight-message"];

const effect: EffectType<{
    highlightEnabled: boolean;
    bannerEnabled: boolean;
    customHighlightColor?: string;
    customBannerText?: string;
    customBannerIcon?: string;
}> = {
    definition: {
        id: "firebot:chat-feed-custom-highlight",
        name: "チャットフィードでメッセージをハイライト",
        description: "Firebot のチャットフィード内メッセージにカスタムハイライトやバナーを適用します",
        icon: "fas fa-highlighter",
        categories: ["common", "chat based", "dashboard"],
        dependencies: ["chat"],
        triggers: triggers
    },
    optionsTemplate: `
    <eos-container pad-top="true">
        <p>Firebot ダッシュボードのチャットメッセージに対して、ハイライトおよび／またはバナーを適用します。</p>
        <p>この設定は Twitch チャット、ブラウザオーバーレイ、その他のチャットクライアントでの表示には<b>影響しません</b>。</p>
    </eos-container>

    <eos-container header="ハイライト" pad-top="true">
        <firebot-checkbox
            label="メッセージをハイライト"
            model="effect.highlightEnabled"
        />

        <p class="muted">ハイライトの色を選択してください。</p>

        <color-picker-input style="margin-top:10px" model="effect.customHighlightColor" label="カラー"></color-picker-input>
    </eos-container>

    <eos-container header="バナー" pad-top="true">
        <firebot-checkbox
            label="バナーを追加"
            model="effect.bannerEnabled"
        />

        <p class="muted">バナーに表示するテキストを入力してください。</p>

        <firebot-input
            model="effect.customBannerText"
            placeholder-text="バナーテキストを入力"
            pad-top="true"
            rows="4"
            useTextArea="true"
            cols="40"
            menu-position="under"
        />

        <p class="muted" style="margin-top: 20px;">バナーに表示するアイコンを選択してください。</p>

        <input
            maxlength="2"
            type="text"
            pad-top="true"
            class="form-control"
            ng-model="effect.customBannerIcon"
            icon-picker required
        />
    </eos-container>
    `,
    optionsController: ($scope) => {
        if ($scope.effect.customHighlightColor === undefined) {
            $scope.effect.customHighlightColor = "#ffcc00"; // Default highlight color
        }
        if ($scope.effect.customBannerText === undefined) {
            $scope.effect.customBannerText = ""; // Default banner text
        }
        if ($scope.effect.customBannerIcon === undefined) {
            $scope.effect.customBannerIcon = "fas fa-circle-info"; // Default banner icon
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!effect.highlightEnabled && !effect.bannerEnabled) {
            errors.push("「メッセージをハイライト」と「バナーを追加」のいずれかは有効にしてください（両方OFFだと何も起こりません）。");
        }
        if (effect.highlightEnabled) {
            if (!effect.customHighlightColor) {
                errors.push("「メッセージをハイライト」が有効な場合、ハイライトの色を指定してください。");
            } else if (!/^#[0-9A-Fa-f]{6}$/.test(effect.customHighlightColor)) {
                errors.push("ハイライトの色は有効な16進カラーコード（例: #ffcc00）で指定してください。");
            }
        }
        if (effect.bannerEnabled) {
            if (!effect.customBannerIcon) {
                errors.push("「バナーを追加」が有効な場合、バナーのアイコンを指定してください。");
            }
            if (!effect.customBannerText) {
                errors.push("「バナーを追加」が有効な場合、バナーのテキストを入力してください。");
            }
        }
        return errors;
    },
    onTriggerEvent: (event) => {
        const { effect, trigger } = event;

        let messageId: string | null = null;
        if (trigger.type === "command") {
            messageId = trigger.metadata.chatMessage?.id;
        } else if (trigger.type === "event") {
            messageId = trigger.metadata.eventData?.chatMessage?.id;
        }

        if (messageId) {
            const highlightData = {
                messageId: messageId,
                customHighlightColor: effect.highlightEnabled ? effect.customHighlightColor : undefined,
                customBannerText: effect.bannerEnabled ? effect.customBannerText : undefined,
                customBannerIcon: effect.bannerEnabled ? effect.customBannerIcon : undefined
            };
            logger.debug("chat-feed-custom-highlight: Highlighting message in chat feed: messageId=", messageId);
            frontendCommunicator.send("chat-feed-custom-highlight", highlightData);
        } else {
            logger.warn("chat-feed-custom-highlight: No messageId found in trigger. Cannot highlight message.");
        }
    }
};

export = effect;