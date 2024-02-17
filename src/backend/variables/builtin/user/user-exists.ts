import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

import viewerDatabase from "../../../viewers/viewer-database";

const model : ReplaceVariable = {
    definition: {
        handle: "userExists",
        usage: "userExists[username]",
        description: "Firebotのデータベースにユーザーが存在する場合は'true'を、存在しない場合は'false'を出力します。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (_, username: string) => {
        const user = await viewerDatabase.getViewerByUsername(username);
        return user != null;
    }
};

export default model;
