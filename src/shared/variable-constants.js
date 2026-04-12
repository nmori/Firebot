"use strict";

/**
 * Enum for a variable's possible output data type.
 * @readonly
 * @enum {string}
 */
const OutputDataType = Object.freeze({
    TEXT: "text",
    NUMBER: "number",
    ALL: "ALL"
});

/**
 * Enum for variable categories.
 * @readonly
 * @enum {string}
 */
const VariableCategory = Object.freeze({
    COMMON: "common",
    TRIGGER: "trigger based",
    USER: "user based",
    TEXT: "text",
    NUMBERS: "numbers",
    ADVANCED: "advanced",
<<<<<<< HEAD
    JP: "jp"
=======
    INTEGRATION: "integrations",
    OBS: "obs"
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
});

exports.OutputDataType = OutputDataType;
exports.VariableCategory = VariableCategory;