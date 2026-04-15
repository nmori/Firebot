import type { ReplaceVariable } from "../../../../types/variables";
import { CounterManager } from "../../../counters/counter-manager";

const model: ReplaceVariable = {
    definition: {
        handle: "counter",
        usage: "counter[name]",
        description: "指定したカウンターの値を表示します。",
        categories: ["numbers"],
        possibleDataOutput: ["number"]
    },
    evaluator: (_, name: string) => {
        const counter = CounterManager.getItemByName(name);
        return counter ? counter.value : -1;
    }
};

export default model;