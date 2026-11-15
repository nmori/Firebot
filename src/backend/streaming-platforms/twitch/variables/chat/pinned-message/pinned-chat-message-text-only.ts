import type { ReplaceVariable } from "../../../../../../types";
import { TwitchApi } from "../../../api";

const model : ReplaceVariable = {
    definition: {
        handle: "pinnedChatMessageTextOnly",
        description: "ピン留めメッセージの本文から、エモート・URL・Cheermoteを除いたテキストを出力します。",
        categories: ["common"],
        possibleDataOutput: ["text"]
    },
    evaluator: async () => {
        const pinnedMessage = await TwitchApi.chat.getPinnedChatMessage();

        const textParts = (pinnedMessage?.message?.fragments ?? [])
            .filter(mp => mp.type === "text" && mp.text !== null)
            .map(mp => mp.text.trim())
            .filter(tp => tp !== "");

        return textParts.join(" ");
    }
};

export default model;