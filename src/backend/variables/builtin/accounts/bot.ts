import type { ReplaceVariable } from "../../../../types/variables";
import { AccountAccess } from "../../../common/account-access";

const model : ReplaceVariable = {
    definition: {
        handle: "bot",
        description: "ボットアカウントのユーザー名を返します。",
        possibleDataOutput: ["text"]
    },
    evaluator: () => {
        return AccountAccess.getAccounts().bot?.loggedIn === true
            ? AccountAccess.getAccounts().bot.username
            : "Unknown Bot";
    }
};

export default model;
