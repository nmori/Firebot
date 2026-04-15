import { join, resolve, sep } from "path";
import { readdirSync } from "fs";

import type { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "filesInDirectory",
        usage: 'filesInDirectory[path\\to\\dir\\]',
        description: "指定したディレクトリ内のファイルの絶対パスの配列を返します。サブディレクトリは含まれません。",
        examples: [
            {
                usage: "filesInDirectory[path\\to\\dir\\, regexp, flags]",
                description: "正規表現フィルタに一致するファイルを一覧表示します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger: Trigger, dirpath: string, filter?: string | RegExp, flags?: string) => {
        if (typeof dirpath === 'string' || <unknown>dirpath instanceof String) {
            dirpath = `${dirpath}`;
        }
        if (typeof dirpath !== 'string' || dirpath === '') {
            return [];
        }

        try {
            const dirList = readdirSync(dirpath, { "withFileTypes": true });
            const fileList = dirList.filter(dirent => dirent.isFile());

            if (typeof filter !== 'string') {
                return fileList
                    .map(dirent => resolve(join(dirent.path, sep, dirent.name)));
            }

            const regexFilter = new RegExp(filter, flags);
            return fileList
                .filter(dirent => regexFilter.test(dirent.name))
                .map(dirent => resolve(join(dirent.path, sep, dirent.name)));

        } catch {}
        return [];
    }
};
export default model;