import { EffectType } from "../../../../types/effects";
import { EffectCategory } from "../../../../shared/effect-constants";
import { HelixChatAnnouncementColor } from "@twurple/api";
import twitchApi from "../../../twitch-api/api";

const model: EffectType<{
    color: string;
    message: string;
    chatter?: string;
}> = {
    definition: {
        id: "firebot:announcement",
        name: "アナウンス",
        description: "アナウンスを送ります",
        icon: "fad fa-bullhorn",
        categories: [EffectCategory.COMMON, EffectCategory.CHAT_BASED, EffectCategory.TWITCH],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-chatter-select effect="effect" title="アナウンスの内容"></eos-chatter-select>

        <eos-container header="メッセージ" pad-top="true">
            <textarea ng-model="effect.message" class="form-control" name="text" placeholder="メッセージを入力" rows="4" cols="40" replace-variables></textarea>
            <div style="color: #fb7373;" ng-if="effect.message && effect.message.length > 500">アナウンスメッセージは500文字を超えることはできません。このメッセージは、すべての置換変数が入力された後、長すぎる場合は自動的に複数のメッセージに分割されます。</div>
        </eos-container>

        <eos-container header="色" pad-top="true">
            <dropdown-select options="announcementColors" selected="effect.color"></dropdown-select>
        </eos-container>
    `,
    optionsController: ($scope) => {
        $scope.announcementColors = ["Primary", "Blue", "Green", "Orange", "Purple"];

        if ($scope.effect.color == null) {
            $scope.effect.color = "Primary";
        }
    },
    optionsValidator: ({ message }) => {
        const errors = [];
        if (message?.length < 1) {
            errors.push("アナウンスメッセージを空白にすることはできません.");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect }) => {
        const { message, chatter } = effect;
        const color = (effect.color.toLowerCase() ?? "primary") as HelixChatAnnouncementColor;

        await twitchApi.chat.sendAnnouncement(message, color, chatter?.toLowerCase() === "bot");

        return true;
    }
};

module.exports = model;
