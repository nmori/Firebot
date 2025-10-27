import type { ReplaceVariable, Trigger, TriggersObject } from "../../../../types/variables";

const triggers: TriggersObject = {};
triggers["event"] = ["firebot:custom-variable-set"];
triggers["manual"] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "createdCustomVariableName",
        description: "作成したカスタム変数名",
        triggers: triggers,
        categories: ["common"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger: Trigger) : unknown => {
        return trigger.metadata.eventData.createdCustomVariableName || "";
    }
};

export default model;