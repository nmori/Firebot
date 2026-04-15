import type { ReplaceVariable } from "../../../../types/variables";

import viewerDatabase from "../../../viewers/viewer-database";

const model : ReplaceVariable = {
    definition: {
        handle: "chatMessages",
        usage: "chatMessages",
        description: "視聴者のチャット発言数を返します（空白の場合は現在の視聴者を使用）。",
        examples: [
            {
                usage: "chatMessages",
                description: "現在の視聴者のチャット発言数を返します。"
            },
            {
                usage: "chatMessages[username]",
                description: "指定したユーザーのチャット発言数を返します。"
            }
        ],
        categories: ["user based"],
        possibleDataOutput: ["number"]
    },
    evaluator: async (trigger, username: string) => {
        if (username == null) {
            username = trigger.metadata.username;
        }
        const viewer = await viewerDatabase.getViewerByUsername(username);
        if (!viewer) {
            return 0;
        }
        return viewer.chatMessages || 0;
    }
};

export default model;
