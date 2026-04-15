import type { ReplaceVariable } from "../../../../types/variables";
import { ReplaceVariableManager } from "../../replace-variable-manager";

const model : ReplaceVariable = {
    definition: {
        handle: "evalVars",
        usage: "evalVars[text]",
        description: "テキスト内の $変数 を評価します。テキストファイルや API などの外部ソースから取得したテキスト内の変数を評価する際に便利です。",
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: async (trigger, text = "") => {
        return await ReplaceVariableManager.populateStringWithTriggerData(text as string, trigger);
    }
};

export default model;
