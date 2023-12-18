// Migration: done

"use strict";

const mathjs = require('mathjs');
const logger = require("../../logwrapper");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");
const utils = require("../../utility");

const model = {
    definition: {
        handle: "math",
        usage: "math[expression]",
        description: '<a href="https://mathjs.org/docs/index.html">math.js</a>を使って数式を評価する',
        categories: [VariableCategory.COMMON, VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: async (trigger, exp) => {

        // TODO(ebiggz, v5.3.2): remove this after a few versions to give users time to not needing to quote arguments to get validation to work
        exp = await utils.populateStringWithTriggerData(exp, trigger);

        let evalulation;
        try {
            evalulation = mathjs.evaluate(exp);
        } catch (err) {
            logger.warn("error parsing math expression", err);
            evalulation = -1;
        }
        if (evalulation != null && typeof evalulation === "object") {
            if (evalulation.entries.length > 0) {
                evalulation = evalulation.entries[0];
            } else {
                evalulation = -1;
            }
        }
        return evalulation != null ? evalulation : -1;
    },
    argsCheck: (exp) => {

        if (exp == null || exp.length < 1) {
            throw new SyntaxError("数式が含まれていなければならない！");
        }

        return true;
    }
};

module.exports = model;
