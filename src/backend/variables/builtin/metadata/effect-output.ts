import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "effectOutput",
        usage: "effectOutput[name]",
        examples: [
            {
                usage: "effectOutput[name, 1]",
                description: "第2引数に配列インデックスを指定して、配列の要素を取得します。"
            },
            {
                usage: "effectOutput[name, property]",
                description: "第2引数にドット記法のプロパティパスを指定して、プロパティを取得します。"
            },
            {
                usage: "effectOutput[name, null, exampleString]",
                description: "エフェクト出力がまだ存在しない場合のデフォルト値を設定します。"
            },
            {
                usage: "effectOutput[name, property, exampleString]",
                description: "指定したプロパティパスにデータがない場合のデフォルト値を設定します。"
            }
        ],
        description: "前のエフェクトが出力したデータを取得します。",
        categories: ["advanced"],
        possibleDataOutput: ["number", "text"]
    },


    evaluator: (
        { effectOutputs },
        name: string,
        propertyPath: string,
        defaultData: unknown = null
    ) => {
        let data = (effectOutputs ?? {})[name];

        if (!data) {
            return defaultData;
        }

        if (propertyPath == null || propertyPath === "null" || propertyPath === '') {
            return data;
        }

        const nodes = propertyPath.split(".");

        if (typeof data === "string") {
            try {
                data = JSON.parse(data);
            } catch { }
        }

        try {
            for (const node of nodes) {
                if (data == null) {
                    return null;
                }
                data = data[node];
            }
            return data ?? defaultData;
        } catch {
            return defaultData;
        }
    }
};

export default model;