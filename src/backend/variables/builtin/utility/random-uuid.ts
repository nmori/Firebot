import { randomUUID } from "crypto";
import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "randomUUID",
        usage: "randomUUID",
        description: "ランダムなフォーマットの UUID を返します（例: 00000000-0000-0000-0000-000000000000）。",
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: () => {
        return randomUUID();
    }
};

export default model;
