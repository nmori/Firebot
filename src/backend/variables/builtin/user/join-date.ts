import type { ReplaceVariable } from "../../../../types/variables";
import viewerDatabase from "../../../viewers/viewer-database";
import { DateTime } from "luxon";

const model : ReplaceVariable = {
    definition: {
        handle: "joinDate",
        usage: "joinDate",
        description: "Firebot が初めて視聴者を検出した日付を返します。",
        examples: [
            {
                usage: "joinDate",
                description: "現在の視聴者の初回検出日を返します。"
            },
            {
                usage: "joinDate[username]",
                description: "指定した視聴者の初回検出日を返します。"
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

        return DateTime.fromMillis(viewer.joinDate).toUTC().toFormat("yyyy-MM-dd");
    }
};

export default model;
