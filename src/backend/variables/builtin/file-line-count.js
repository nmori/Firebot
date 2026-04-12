// Migration: done

"use strict";

const fs = require("fs");
const logger = require("../../../../backend/logwrapper");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const logger = require("../../logwrapper");

const model = {
    definition: {
        handle: "fileLineCount",
        usage: "fileLineCount[\"path/to/file.txt\"]",
        description: "繝・く繧ｹ繝医ヵ繧｡繧､繝ｫ縺ｮ陦梧焚繧呈焚縺医ｋ縲・,
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
