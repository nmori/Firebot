import type { ReplaceVariable, Trigger, TriggersObject } from "../../../../types/variables";

const triggers: TriggersObject = {};
triggers["event"] = ["firebot:custom-variable-set"];
triggers["manual"] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "createdCustomVariableName",
        description: "作成されたカスタム変数の名前を返します。",
        triggers: triggers,
        categories: ["trigger based", "common"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger: Trigger) : unknown => {
        return trigger.metadata.eventData.createdCustomVariableName || "";
    }
};

export default model;