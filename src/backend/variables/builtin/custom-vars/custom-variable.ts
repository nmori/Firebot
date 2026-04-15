import type { ReplaceVariable, Trigger } from "../../../../types/variables";

import customVariableRaw from './custom-variable-raw';

const model : ReplaceVariable = {
    definition: {
        handle: "customVariable",
        usage: "customVariable[name]",
        examples: [
            {
                usage: "customVariable[name, 1]",
                description: "第2引数に配列インデックスを指定して、配列要素を取得します。"
            },
            {
                usage: "customVariable[name, property]",
                description: "第2引数にドット記法のプロパティパスを指定して、プロパティを取得します。"
            },
            {
                usage: "customVariable[name, null, exampleString]",
                description: "カスタム変数がまだ存在しない場合のデフォルト値を設定します。"
            }
        ],
        description: "カスタム変数に保存されたデータを取得します。",
        categories: ["advanced"],
        possibleDataOutput: ["number", "text"]
    },
    evaluator: (trigger: Trigger, ...args: unknown[]) => {
        const data = customVariableRaw.evaluator(trigger, ...args);
        if (data == null) {
            return null;
        }
        if (typeof data === 'string' || data instanceof String) {
            return `${data}`;
        }
        return JSON.stringify(data);
    }
};


export default model;