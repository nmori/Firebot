import type { ReplaceVariable } from "../../../../types/variables";

import viewerDatabase from "../../../viewers/viewer-database";

const model : ReplaceVariable = {
    definition: {
        handle: "userExists",
        usage: "userExists[username]",
        description: "Firebot のデータベースにユーザーが存在する場偂は 'true' 、存在しない場偂は 'false' を返します。",
        categories: ["advanced"],
        possibleDataOutput: ["text", "bool"]
    },
    evaluator: async (_, username: string) => {
        const user = await viewerDatabase.getViewerByUsername(username);
        return user != null;
    }
};

export default model;
