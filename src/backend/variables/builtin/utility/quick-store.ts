import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "quickStore",
        usage: "quickStore[key]",
        description: "式の評価が完了するまでの間、値を一時的に保存・取得します。",
        examples: [
            {
                usage: 'quickStore[name, value]',
                description: '"value" を "name" というキーで保存します。'
            }, {
                usage: 'quickStore[name]',
                description: '"name" というキーで保存した値を取得します。'

            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["ALL"]
    },
    evaluator: function (
        trigger: Trigger,
        key: string,
        value: unknown
    ) {
        if (
            arguments.length < 2 ||
            typeof key !== 'string' ||
            key === ''
        ) {
            return '';
        }

        const meta = trigger.metadata;

        if (meta.quickstore == null) {
            meta.quickstore = Object.create(null);
        }
        const quickstore = meta.quickstore as Record<string, unknown>;

        // Retrieve value
        if (arguments.length < 3) {
            if (quickstore[key]) {
                return quickstore[key];
            }
            return '';
        }

        // unset value
        if (value == null || value === '') {
            delete quickstore[key];
            return '';
        }

        // set value
        quickstore[key] = value;
        return value;
    }
};

export default model;