import type { ReplaceVariable } from "../../../../types/variables";
import viewerDatabase from "../../../viewers/viewer-database";
import { DateTime } from "luxon";

const model : ReplaceVariable = {
    definition: {
        handle: "lastSeen",
        usage: "lastSeen",
        description: "Firebot が視聴者を最後に検出した日付を返します。",
        examples: [
            {
                usage: "lastSeen",
                description: "現在の視聴者の最後検出日を返します。"
            },
            {
                usage: "lastSeen[username]",
                description: "指定した視聴者の最後検出日を返します。"
            }
        ],
        categories: ["user based"],
        possibleDataOutput: ["text"]
    },
    evaluator: async (trigger, username: string) => {
        if (username == null) {
            username = trigger.metadata.username;
        }
        const viewer = await viewerDatabase.getViewerByUsername(username);
        if (!viewer) {
            return "Unknown User";
        }
        return DateTime.fromMillis(viewer.lastSeen).toUTC().toFormat("yyyy-MM-dd");
    }
};

export default model;
