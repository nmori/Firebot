import type { ReplaceVariable } from "../../../../types/variables";
import { processDice } from "../../../common/handlers/dice-processor";

const model : ReplaceVariable = {
    definition: {
        handle: "rollDice",
        usage: "rollDice[diceConfig]",
        examples: [
            {
                usage: "rollDice[1d6]",
                description: "6面ダイスをで1回振り、合計値を返します。"
            },
            {
                usage: "rollDice[2d10+1d12]",
                description: "10面ダイス2個と 12面ダイス1個を振り、合計値を返します。"
            },
            {
                usage: "rollDice[2d6, show each]",
                description: "合計値と各ダイスの詳細を含むテキストを返します。例: '10 (4, 6)'"
            }
        ],
        description: "指定した設定（例: 2d6, 2d10+1d12, 1d10+3）でダイスを振ります。",
        categories: ["common", "numbers"],
        possibleDataOutput: ["number", "text"]
    },
    evaluator: (_, diceConfig: string, option: string) => {
        const showEach = option?.toLowerCase() === "show each";
        const output = processDice(diceConfig, showEach);
        return (output == null || output === '') ? 0 : output;
    }
};

export default model;