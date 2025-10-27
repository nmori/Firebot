import type { ReplaceVariable, Trigger, TriggersObject } from "../../../../types/variables";

const triggers: TriggersObject = {};
triggers["event"] = ["firebot:custom-variable-expired"];
triggers["manual"] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "expiredCustomVariableData",
        description: "期限切れカスタム変数のデータ。",
        triggers: triggers,
        categories: ["common"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger: Trigger) : unknown => {
        const expiredCustomVariableData = trigger.metadata.eventData.expiredCustomVariableData;

        return expiredCustomVariableData;
    }
};

export default model;
