import type { ReplaceVariable } from "../../../../types/variables";
import { AccountAccess } from "../../../common/account-access";

const model : ReplaceVariable = {
    definition: {
        handle: "streamer",
        description: "ストリーマーアカウントのユーザー名を返します。",
        possibleDataOutput: ["text"]
    },
    evaluator: () => {
        return AccountAccess.getAccounts().streamer.username;
    }
};

export default model;
