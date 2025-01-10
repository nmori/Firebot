import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

import viewerDatabase from "../../../viewers/viewer-database";

const model : ReplaceVariable = {
    definition: {
        handle: "viewTime",
        usage: "viewTime",
        description: "指定された視聴者の表示時間（時間単位）を表示します（現在の視聴者を使用する場合は空白のままにします）。",
        examples: [
            {
                usage: "viewTime",
                description: "Returns view time for current viewer"
            },
            {
                usage: "viewTime[username]",
                description: "Returns view time for specified viewer"
            }
        ],
        categories: [VariableCategory.USER],
        possibleDataOutput: [OutputDataType.NUMBER, OutputDataType.TEXT]
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
