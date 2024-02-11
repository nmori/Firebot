import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const model : ReplaceVariable = {
    definition: {
        handle: "ANY",
        usage: "ANY[条件, 条件, ...]",
        description: '条件のいずれかが成立する場合、Trueを返す。$if[] 内でのみ動作します。',
        examples: [
            {
                usage: 'ANY[a === b, c === c]',
                description: "Returns true as c equals c"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.BOOLEAN],
        spoof: true
    }
};

export default model;