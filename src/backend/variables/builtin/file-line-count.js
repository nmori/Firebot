// Migration: done

"use strict";

const fs = require("fs");
<<<<<<< HEAD:src/backend/variables/builtin/file-line-count.js
=======
const logger = require("../../../../backend/logwrapper");
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20:src/backend/variables/builtin/utility/file-line-count.ts

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const logger = require("../../logwrapper");

const model = {
    definition: {
        handle: "fileLineCount",
        usage: "fileLineCount[\"path/to/file.txt\"]",
        description: "テキストファイルの行数を数える。",
        categories: [VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (_, filePath) => {
        if (filePath === null || !filePath.endsWith(".txt")) {
            logger.error(`Couldn't read file (${filePath}) to count the lines in it.`);
            return 0;
        }

        try {
            const contents = fs.readFileSync(filePath, { encoding: "utf8" });
            const lines = contents
                .split('\n')
                .filter(l => l != null && l.trim() !== "");

            return lines.length;
        } catch (err) {
            logger.error("error counting lines in file", err);
            return 0;
        }
    }
};

module.exports = model;
