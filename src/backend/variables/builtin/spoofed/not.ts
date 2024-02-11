import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const model : ReplaceVariable = {
    definition: {
        handle: "NOT",
        usage: "NOT[条件]",
        description: '条件と逆の結果を返す。$if[]内でのみ動作する。',
        examples: [
            {
                usage: 'NOT[1 === 1]',
                description: "条件が成立しているので False を返す"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.BOOLEAN],
        spoof: true
    }
};

export default model;