import type { ReplaceVariable } from "../../../../types/variables";
import type { TriggersObject } from "../../../../types/triggers";

const triggers: TriggersObject = {
    counter: true
};

const model: ReplaceVariable = {
    definition: {
        handle: "counterMaximum",
        description: "カウンターの最大値を返します。最大値がない場合は空文字を返します。",
        triggers: triggers,
        categories: ["trigger based", "numbers"],
        possibleDataOutput: ["number"]
    },
    evaluator: (trigger) => {
        return trigger.metadata.counter.maximum ?? "";
    }
};

export default model;