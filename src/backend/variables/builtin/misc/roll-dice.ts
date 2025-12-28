import type { ReplaceVariable } from "../../../../types/variables";
import { processDice } from "../../../common/handlers/diceProcessor";

const model : ReplaceVariable = {
    definition: {
        handle: "rollDice",
        usage: "rollDice[diceConfig]",
        examples: [
            {
                usage: "rollDice[1d6]",
                description: "6 面体のサイコロを 1 つ振り、合計を出力します。"
            },
            {
                usage: "rollDice[2d10+1d12]",
                description: "10 面ダイスを 2 個と 12 面ダイスを 1 個振り、合計を出力します。"
            },
            {
                usage: "rollDice[2d6, show each]",
                description: "合計と各ロールの値の両方を含むテキストを出力します。例: '10 (4, 6)'"
            }
        ],
        description: "2d6、2d10+1d12、1d10+3 など、指定した設定に基づいてサイコロを振ります。",
        categories: ["common", "numbers"],
        possibleDataOutput: ["number", "text"]
    },
    evaluator: (_, diceConfig, option: string) => {
        const showEach = option?.toLowerCase() === "show each";
        const output = processDice(diceConfig, showEach);
        return (output == null || output === '') ? 0 : output;
    }
};

export default model;