import type { ReplaceVariable } from "../../../../../../types";
import { TwitchApi } from "../../../api";

const model : ReplaceVariable = {
    definition: {
        handle: "pinnedChatMessageUsername",
        description: "現在のピン留めメッセージを送信したユーザーのユーザー名です。",
        categories: ["common"],
        possibleDataOutput: ["text"]
    },
    evaluator: async () => {
        const pinnedMessage = await TwitchApi.chat.getPinnedChatMessage();
        return pinnedMessage?.senderUserLogin ?? "";
    }
};

export default model;