import type { ReplaceVariable } from "../../../../../../types";
import { TwitchApi } from "../../../api";

const model : ReplaceVariable = {
    definition: {
        handle: "pinnedByUsername",
        description: "現在のピン留めメッセージをピン留めしたユーザーのユーザー名です。",
        categories: ["common"],
        possibleDataOutput: ["text"]
    },
    evaluator: async () => {
        const pinnedMessage = await TwitchApi.chat.getPinnedChatMessage();
        return pinnedMessage?.pinnedByUserLogin ?? "";
    }
};

export default model;