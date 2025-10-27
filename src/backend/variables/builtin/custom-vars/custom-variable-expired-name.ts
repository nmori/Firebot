import type { ReplaceVariable, Trigger, TriggersObject } from "../../../../types/variables";

const triggers: TriggersObject = {};
triggers["event"] = ["firebot:custom-variable-expired"];
triggers["manual"] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "expiredCustomVariableName",
        description: "時間切れとなったカスタム変数名",
        triggers: triggers,
        categories: ["common"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger: Trigger) : unknown => {
        const expiredCustomVariableName = trigger.metadata.eventData.expiredCustomVariableName;
        return expiredCustomVariableName;
    }
};

export default model;
