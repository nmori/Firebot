import type { ReplaceVariable, Trigger, TriggersObject } from "../../../../types/variables";

const triggers: TriggersObject = {};
triggers["event"] = ["firebot:custom-variable-expired"];
triggers["manual"] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "expiredCustomVariableData",
        description: "期限切れになったカスタム変数のデータを返します。",
        triggers: triggers,
        categories: ["trigger based", "common"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger: Trigger) : unknown => {
        const expiredCustomVariableData = trigger.metadata.eventData.expiredCustomVariableData;

        return expiredCustomVariableData;
    }
};

export default model;
