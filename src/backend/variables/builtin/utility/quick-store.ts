import { ReplaceVariable, Trigger } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const model : ReplaceVariable = {
    definition: {
        handle: "quickStore",
        usage: "quickStore[key]",
        description: "式の評価が終了するまで、値を取得または保存する。",
        examples: [
            {
                usage: 'quickStore[name, value]',
                description: 'キー "name "の下に "value "を格納する。'
            }, {
                usage: 'quickStore[name]',
                description: '"name "のキーの下に格納されていた値を取得する。'

            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.ALL]
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
        const quickstore = meta.quickstore;

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