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
        name: "繧｢繝翫え繝ｳ繧ｹ",
        description: "繧｢繝翫え繝ｳ繧ｹ繧帝√ｊ縺ｾ縺・,
        icon: "fad fa-bullhorn",
        categories: [EffectCategory.COMMON, EffectCategory.CHAT_BASED, EffectCategory.TWITCH],
        dependencies: {
            twitch: true
        }
    },
    optionsTemplate: `
        <eos-chatter-select effect="effect" title="繧｢繝翫え繝ｳ繧ｹ縺ｮ蜀・ｮｹ"></eos-chatter-select>

        <eos-container header="Message" pad-top="true">
            <firebot-input
                model="effect.message"
                use-text-area="true"
                placeholder-text="Enter message"
                rows="4"
                cols="40"
                menu-position="under"
            />
            <div style="color: #fb7373;" ng-if="effect.message && effect.message.length > 500">Announcement messages cannot be longer than 500 characters. This message will get automatically chunked into multiple messages if it is too long after all replace variables have been populated.</div>
        </eos-container>

        <eos-container header="濶ｲ" pad-top="true">
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
            errors.push("繧｢繝翫え繝ｳ繧ｹ繝｡繝・そ繝ｼ繧ｸ繧堤ｩｺ逋ｽ縺ｫ縺吶ｋ縺薙→縺ｯ縺ｧ縺阪∪縺帙ｓ.");
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
