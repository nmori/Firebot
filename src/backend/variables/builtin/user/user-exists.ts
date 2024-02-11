import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const userDb = require("../../../database/userDatabase");

const model : ReplaceVariable = {
    definition: {
        handle: "userExists",
        usage: "userExists[username]",
        description: "Firebotのデータベースにユーザーが存在する場合は'true'を、存在しない場合は'false'を出力します。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (trigger, username) => {
        const user = await userDb.getTwitchUserByUsername(username);
        return user != null;
    }
};

export default model;
