import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const model : ReplaceVariable = {
    definition: {
        handle: "OR",
        usage: "OR[条件, 条件, ...]",
        description: '条件のいずれかが成立する場合に true を返します。$if[]内でのみ動作します。',
        examples: [
            {
                usage: 'OR[a === b, c === c]',
                description: "c が c と等しい場合に True を返す"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.BOOLEAN],
        spoof: true
    }
};

export default model;