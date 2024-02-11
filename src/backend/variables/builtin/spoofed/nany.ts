import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const model : ReplaceVariable = {
    definition: {
        handle: "NANY",
        usage: "NANY[条件, 条件, ...]",
        description: 'すべての条件が不成立である場合に True を返す。',
        examples: [
            {
                usage: 'NANY[a === b, b === c]',
                description: "a が be と等しくなく、b が c と等しくない場合に True を返す。"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.BOOLEAN],
        spoof: true
    }
};

export default model;