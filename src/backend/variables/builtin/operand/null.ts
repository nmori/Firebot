import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "null",
        description: "リテラルの null を返します。$if[] などの比較で使用できます。",
        usage: "null",
        categories: ["advanced"],
        possibleDataOutput: ["null"]
    },
    evaluator: () => null
};
export default model;