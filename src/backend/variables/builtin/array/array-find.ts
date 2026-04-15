import type { ReplaceVariable, Trigger } from "../../../../types/variables";

import arrayFindIndex from "./array-find-index";

const model : ReplaceVariable = {
    definition: {
        handle: "arrayFind",
        usage: "arrayFind[array, matcher, propertyPath?, exact?]",
        description: "配列内で一致する要素を返します。一致しない場合はテキスト 'null' を返します。",
        examples: [
            {
                usage: 'arrayFind["[1,2,3]", 1]',
                description: "配列内の 1 を検索します。"
            },
            {
                usage: 'arrayFind["[{\\"username\\": \\"ebiggz\\"},{\\"username\\": \\"MageEnclave\\"}]", ebiggz, username]',
                description: 'username が "ebiggz" のオブジェクトを返します。'
            },
            {
                usage: 'arrayFind["[0,1,2,"1"]", 1, null, true]',
                description: "テキスト '1' を返します。"
            },
            {
                usage: 'arrayFind[rawArray, value]',
                description: '"value" と一致する最初の要素を返します。'
            },
            {
                usage: 'arrayFind[rawArray, value, key]',
                description: '"key" プロパティが "value" と等しい要素を返します。'
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text", "number"]
    },

    evaluator: (
        trigger: Trigger,
        subject: string | unknown[],
        matcher: unknown,
        propertyPath : string = null,

        exact : boolean | string = false
    ) : unknown => {
        if (typeof subject === 'string' || subject instanceof String) {
            try {
                subject = JSON.parse(`${subject}`);
            } catch (ignore) {
                return "null";
            }
        }
        if (!Array.isArray(subject)) {
            return "null";
        }

        const index = <number>arrayFindIndex.evaluator(trigger, subject, matcher, propertyPath, exact);
        if (index == null) {
            return "null";
        }
        return subject[index];
    }
};

export default model;