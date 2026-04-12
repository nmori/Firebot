import type { ReplaceVariable } from "../../../../../../types/variables";
import { SharedChatCache } from "../../../chat/shared-chat-cache";

const model : ReplaceVariable = {
    definition: {
        handle: "isSharedChatEnabled",
        description: "Shared Chat セッション中なら true、それ以外は false を返します。",
        categories: ["common"],
        possibleDataOutput: ["bool"]
    },
    evaluator: () => {
        return SharedChatCache.isActive;
    }
};

export default model;