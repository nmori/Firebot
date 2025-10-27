import type { ReplaceVariable } from "../../../../types/variables";
import { ReplaceVariableManager } from "../../replace-variable-manager";

const model : ReplaceVariable = {
    definition: {
        handle: "evalVars",
        usage: "evalVars[text]",
        description: "文字列の $variables を評価します。外部ソース (txt ファイルや API) からのテキスト $vars を評価する際に便利です。",
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: async (trigger, text = "") => {
        return await ReplaceVariableManager.populateStringWithTriggerData(text as string, trigger);
    }
};

export default model;
