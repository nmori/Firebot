import type { ReplaceVariable } from "../../../../types/variables";
import type { TriggersObject } from "../../../../types/triggers";

const triggers: TriggersObject = {
    counter: true
};

const model: ReplaceVariable = {
    definition: {
        handle: "counterName",
        description: "カウンターの名前を返します。",
        triggers: triggers,
        categories: ["trigger based", "text"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger) => {
        return trigger.metadata.counter.name;
    }
};

export default model;