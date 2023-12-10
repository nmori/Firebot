// Migration: done

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "ensureNumber",
        description: "数値での出力を保証します。入力が数値の場合、そのまま渡されます。そうでない場合は、指定されたデフォルトの数字が代わりに使用されます。",
        usage: "ensureNumber[input, defaultNumber]",
        categories: [VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (_, input, defaultNumber) => {

        // cast input as number, and if its finite return the recast input
        if (input != null && input.length > 0 && !isNaN(input)) {
            return Number(input);
        }

        // cast defaultNumber as number and if finite return it
        if (defaultNumber != null && defaultNumber.length > 0 && !isNaN(defaultNumber)) {
            return Number(defaultNumber);
        }

        // Defaults to 0
        return 0;
    }
};

module.exports = model;
