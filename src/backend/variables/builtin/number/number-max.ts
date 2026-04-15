import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const normalizeNumber = (input) => {
    const value = Number(input);
    return Number.isFinite(value) ? value : null;
};

const model : ReplaceVariable = {
    definition: {
        handle: "max",
        description: "最大値の数値を返します。",
        usage: "max[num1, num2, ...]",
        examples: [
            {
                usage: "max[1, 5, 3, 10]",
                description: "入力した数値の中から最大値 10 を返します"
            },
            {
                usage: "max[numberArray]",
                description: "数値の配列から最大値を返します"
            },
            {
                usage: "max[``[1, 5, 3, 10]``]",
                description: "文字列化された数値配列の中から最大値 10 を返します"
            },
            {
                usage: "max[``[8, 12]``, 5, 3, 10]",
                description: "文字列配列と数値を組み合わせた中から最大値 12 を返します"
            }
        ],
        categories: ["numbers"],
        possibleDataOutput: ["number"]
    },
    evaluator: (
        trigger: Trigger,
        ...args: Array<string | number | Array<string | number>>
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

        const max = Math.max(...numArgs);
        return Number.isNaN(max) ? 0 : max;
    }
};

export default model;