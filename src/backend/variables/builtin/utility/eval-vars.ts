import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const utils = require("../../../utility");

const model : ReplaceVariable = {
    definition: {
        handle: "evalVars",
        usage: "evalVars[text]",
        description: "文字列の $variables を評価します。外部ソース (txt ファイルや API) からのテキスト $vars を評価する際に便利です。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (trigger, text = "") => {
        return await utils.populateStringWithTriggerData(text, trigger);
    }
};

export default model;
