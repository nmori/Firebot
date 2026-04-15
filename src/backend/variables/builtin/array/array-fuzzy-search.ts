import Fuse, { IFuseOptions } from "fuse.js";
import type { ReplaceVariable } from "../../../../types/variables";

const model: ReplaceVariable = {
    definition: {
        handle: "arrayFuzzySearch",
        usage: "arrayFuzzySearch[array, search, propertyPaths?, defaultValue?, threshold?, ignoreDiacritics?]",
        description: "配列内で指定した検索に最も近い要素を返します。threshold（0.0〜1.0）でフィルタ可能（0.0 が厳格、1.0 が緩やか）。ダイアクリティカルマーク（é, à, ç, ñ 等）の無視も設定できます。",
        categories: ["advanced"],
        possibleDataOutput: ["text", "number"],
        examples: [
            {
                usage: 'arrayFuzzySearch["[\\"apple\\", \\"banana\\", \\"cherry\\"]", apfl]',
                description: 'テキスト "apple" を返します。'
            },
            {
                usage: 'arrayFuzzySearch["[{\\"username\\": \\"ebiggz\\"},{\\"username\\": \\"Oceanity\\"}]", eggz, username]',
                description: 'username が "ebiggz" のオブジェクトを返します。'
            },
            {
                usage: 'arrayFuzzySearch["[{\\"username\\": \\"ebiggz\\",\\"id\\": 1234567},{\\"username\\": \\"Oceanity\\",\\"id\\": 9876543}]", 2455678, "[\\"username\\",\\"id\\"]"]',
                description: '複数のプロパティを使ってオブジェクトを検索します。'
            },
            {
                usage: 'arrayFuzzySearch["[\\"apple\\", \\"banana\\", \\"cherry\\"]", apfl, nothing, null, 0.2]',
                description: 'しきい値を超えた結果のため、デフォルトテキスト "nothing" を返します。'
            },
            {
                usage: 'arrayFuzzySearch["[\\"piñata\\"]", pinata, null, nothing, 0.0, true]',
                description: 'ダイアクリティカルマークを無視して完全一致のみ検索し、"piñata" を返します。'
            }
        ]
    },
    evaluator: async (
        _trigger,
        subject: string | unknown[],
        search: string,
        propertyPaths?: string | unknown[],
        defaultValue?: unknown,
        threshold?: string | number,
        ignoreDiacritics?: string | boolean
    ) => {
        if (defaultValue === undefined) {
            defaultValue = "null";
        }

        if (typeof subject === "string" || subject instanceof String) {
            try {
                subject = JSON.parse(`${subject}`);
            } catch (error) {
                return defaultValue;
            }
        }

        if (!Array.isArray(subject)) {
            return defaultValue;
        }

        const options: IFuseOptions<unknown> = {};

        if (propertyPaths != null && propertyPaths !== "null" && propertyPaths !== '') {
            if (typeof propertyPaths === "string" || propertyPaths instanceof String) {
                try {
                    propertyPaths = JSON.parse(`${propertyPaths}`);
                } catch (error) {
                    propertyPaths = [propertyPaths];
                }
            }
            options.keys = propertyPaths as Array<string>;
        }

        if (threshold != null && threshold !== "null" && threshold !== '') {
            try {
                threshold = parseFloat(`${threshold}`);

                if (!isNaN(threshold)) {
                    options.threshold = threshold;
                }
            } catch (error) {
                console.error(error);
            }
        }

        if (ignoreDiacritics && ignoreDiacritics !== "false") {
            options.ignoreDiacritics = true;
        }

        const fuse = new Fuse(subject, options);

        const result = fuse.search(search);

        if (!result.length) {
            return defaultValue;
        }

        return result[0].item;
    }
};

export default model;