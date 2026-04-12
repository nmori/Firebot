import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const model : ReplaceVariable = {
    definition: {
        handle: "ALL",
        usage: "ALL[条件, 条件, ...]",
        description: 'すべての条件が成立する場合、 true を返します。$if[]内でのみ動作します。',
        examples: [
            {
                usage: 'ALL[a === a, b === b]',
                description: "a が a に等しく、b が b に等しいとき、true を返します"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.BOOLEAN],
        spoof: true
    }
};

export default model;