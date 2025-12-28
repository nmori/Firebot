import { randomUUID } from "crypto";
import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "randomUUID",
        usage: "randomUUID",
        description: "ランダムな形式の UUID（例: 00000000-0000-0000-0000-000000000000）を返します。",
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: () => {
        return randomUUID();
    }
};

export default model;
