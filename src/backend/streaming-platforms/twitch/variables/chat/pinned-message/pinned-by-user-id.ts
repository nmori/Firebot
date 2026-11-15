import type { ReplaceVariable } from "../../../../../../types";
import { TwitchApi } from "../../../api";

const model : ReplaceVariable = {
    definition: {
        handle: "pinnedByUserId",
        description: "現在のピン留めメッセージをピン留めしたユーザーの ID です。",
        categories: ["common"],
        possibleDataOutput: ["text"]
    },
    evaluator: async () => {
        const pinnedMessage = await TwitchApi.chat.getPinnedChatMessage();
        return pinnedMessage?.pinnedByUserId ?? "";
    }
};

export default model;