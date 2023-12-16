// Migration: info - Need implementation details

"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.MANUAL] = true;

/**
 * The $target variable
 */
const commmandTarget = {
    definition: {
        handle: "target",
        description: "arg変数と似ていますが、先頭の'@'記号を取り除きます。引数がユーザ名であると予想される場合に便利である。",
        usage: "target",
        examples: [
            {
                usage: "target[#]",
                description: "指定されたインデックスのターゲットをつかむ (IE で '!command @ebiggz @TheLastMage' とすると、$target[2] は 'TheLastMage' となる)"
            }
        ],
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger, index) => {
        let args = trigger.metadata.userCommand.args;
        if (args == null || args === '') {
            args = [];
        }

        index = parseInt(index);

        if (index != null && index > 0) {
            index--;
        } else {
            index = 0;
        }

        if (args.length < index || args[index] == null) {
            return null;
        }

        return args[index].replace("@", "");
    },
    argsCheck: (index) => {
        // index can be null
        if (index == null) {
            return true;
        }

        // index needs to be a number
        if (isNaN(index)) {
            throw new SyntaxError("Index needs to be a number.");
        }

        return true;
    }
};

module.exports = commmandTarget;
