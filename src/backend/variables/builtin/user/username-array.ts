import type { ReplaceVariable } from "../../../../types/variables";

import viewerDatabase from "../../../viewers/viewer-database";

const model : ReplaceVariable = {
    definition: {
        handle: "usernameArray",
        description: "ユーザー DB に保存されている全ユーザー名の配列を返します。",
        categories: ["advanced"],
        possibleDataOutput: ["array"]
    },
    evaluator: async () => {
        const usernames = await viewerDatabase.getAllUsernames();
        return usernames;
    }
};

export default model;
