import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const normalizeNumber = (input) => {
    const value = Number(input);
    return Number.isFinite(value) ? value : null;
};

const model : ReplaceVariable = {
    definition: {
        handle: "min",
        description: "最小値の数値を返します。",
        usage: "min[num1, num2, ...]",
        examples: [
            {
                usage: "min[1, 5, 3, 10]",
                description: "入力した数値の中から最小値 1 を返します"
            },
            {
                usage: "min[numberArray]",
                description: "数値の配列から最小値を返します"
            },
            {
                usage: "min[``[1, 5, 3, 10]``]",
                description: "文字列化された数値配列の中から最小値 1 を返します"
            },
            {
                usage: "min[``[8, 12]``, 5, 3, 10]",
                description: "文字列配列と数値を組み合わせた中から最小値 3 を返します"
            }
        ],
        categories: ["numbers"],
        possibleDataOutput: ["null", "number"]
    },
    evaluator: (
        trigger: Trigger,
        ...args: Array<string | number>
    ) : number => {
        const numArgs : number[] = args.flatMap((value) => {
            if (Array.isArray(value)) {
                return value.map(normalizeNumber);
            }
            if (typeof value === "string") {
                try {
                    const parsed = JSON.parse(value) as object;
                    if (Array.isArray(parsed)) {
                        return parsed.map(normalizeNumber);
                    }
                } catch {
                    return normalizeNumber(value);
                }
            }
            return normalizeNumber(value);
        }).filter(value => value !== null);

        const max = Math.min(...numArgs);
        return Number.isNaN(max) ? 0 : max;
    }
};

export default model;