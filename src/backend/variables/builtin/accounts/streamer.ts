import type { ReplaceVariable } from "../../../../types/variables";
import { AccountAccess } from "../../../common/account-access";

const model : ReplaceVariable = {
    definition: {
        handle: "streamer",
        description: "Streamer アカウントのユーザー名を出力する。",
        possibleDataOutput: ["text"]
    },
    evaluator: () => {
        return AccountAccess.getAccounts().streamer.username;
    }
};

export default model;
