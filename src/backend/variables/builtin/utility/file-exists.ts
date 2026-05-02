import fs from "fs";
import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import logger from "../../../logwrapper";

const model : ReplaceVariable = {
    definition: {
        handle: "fileExists",
        usage: 'fileExists[path\\to\\file.txt]',
        description: "ファイルが存在する場合は true、存在しない場合は false を返します。",
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        filePath: string
    ) : boolean => {

        if (typeof filePath !== "string" || filePath.length === 0) {
            return false;
        }

        try {
            return fs.existsSync(filePath) ? true : false;
        } catch (err) {
            logger.error(`Error checking if file "${filePath}" exists`, err);
            return false;
        }
    }
};

export default model;
