import type { ReplaceVariable } from "../../../../types/variables";

import viewerDatabase from "../../../viewers/viewer-database";

const model : ReplaceVariable = {
    definition: {
        handle: "userExists",
        usage: "userExists[username]",
        description: "Firebotのデータベースにユーザーが存在する場合は'true'を、存在しない場合は'false'を出力します。",
        categories: ["advanced"],
        possibleDataOutput: ["text", "bool"]
    },
    evaluator: async (_, username: string) => {
        const user = await viewerDatabase.getViewerByUsername(username);
        return user != null;
    }
};

export default model;
