import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const model : ReplaceVariable = {
    definition: {
        handle: "NAND",
        usage: "NAND[条件, 条件, ...]",
        description: 'いずれかの条件が不成立の場合にTrueを返す。',
        examples: [
            {
                usage: 'NAND[a === a, b === c]',
                description: "b が c に等しくないとき、True を返す"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.BOOLEAN],
        spoof: true
    }
};

export default model;