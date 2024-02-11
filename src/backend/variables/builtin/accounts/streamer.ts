import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType } from "../../../../shared/variable-constants";

const accountAccess = require("../../../common/account-access");

const model : ReplaceVariable = {
    definition: {
        handle: "streamer",
        description: "Streamer アカウントのユーザー名を出力する。",
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: () => {
        return accountAccess.getAccounts().streamer.username;
    }
};

export default model;
