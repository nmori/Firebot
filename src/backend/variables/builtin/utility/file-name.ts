import { basename, extname } from "path";
import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "fileName",
        usage: 'fileName[path\\to\\file.txt]',
        description: "拡張子を除いたファイル名を返します。",
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        filePath?: string
    ) : string => {
        if (!filePath) {
            return "";
        }

        try {
            return basename(filePath, extname(filePath));
        } catch {
            // Probably a directory or invalid filename
            return "[無効なファイルパスです]";
        }
    }
};

export default model;
