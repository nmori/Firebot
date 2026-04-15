import type { ReplaceVariable } from "../../../../types/variables";

import viewerDatabase from "../../../viewers/viewer-database";

const model : ReplaceVariable = {
    definition: {
        handle: "viewTime",
        usage: "viewTime",
        description: "視聴者の視聴時間（時間）を返します（空白の場偂は現在の視聴者を使用）。",
        examples: [
            {
                usage: "viewTime",
                description: "現在の視聴者の視聴時間を返します。"
            },
            {
                usage: "viewTime[username]",
                description: "指定した視聴者の視聴時間を返します。"
            }
        ],
        categories: ["user based"],
        possibleDataOutput: ["number", "text"]
    },
    evaluator: async (trigger, username: string) => {
        if (username == null) {
            username = trigger.metadata.username;
        }
        const viewer = await viewerDatabase.getViewerByUsername(username);
        if (!viewer) {
            return 0;
        }
        return viewer.minutesInChannel < 60 ? 0 : Math.floor(viewer.minutesInChannel / 60);
    }
};

export default model;
