import type { ReplaceVariable } from "../../../../../../types";
import { TwitchApi } from "../../../api";

const model : ReplaceVariable = {
    definition: {
        handle: "pinnedByUserDisplayName",
        description: "現在のピン留めメッセージをピン留めしたユーザーの表示名です。",
        categories: ["common"],
        possibleDataOutput: ["text"]
    },
    evaluator: async () => {
        const pinnedMessage = await TwitchApi.chat.getPinnedChatMessage();
        return pinnedMessage?.pinnedByUserName ?? "";
    }
};

export default model;