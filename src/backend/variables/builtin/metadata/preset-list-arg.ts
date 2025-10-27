import type { ReplaceVariable, TriggersObject } from "../../../../types/variables";

const triggers: TriggersObject = {};
triggers["quick_action"] = true;
triggers["preset"] = true;
triggers["manual"] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "presetListArg",
        usage: "presetListArg[name]",
        description: "このプリセット演出リストに渡された与えられた引数を表す。",
        triggers: triggers,
        categories: ["common", "trigger based"],
        possibleDataOutput: ["number", "text"]
    },

    evaluator: (trigger, argName: string = "") => {
        const args = trigger.metadata.presetListArgs || {};
        return args[argName] || null;
    }
};

export default model;
