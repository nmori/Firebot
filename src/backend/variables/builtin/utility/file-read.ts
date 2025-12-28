import fs from "fs/promises";

import type { ReplaceVariable, Trigger } from "../../../../types/variables";

import logger from "../../../logwrapper";
import { getRandomInt } from "../../../utils";

const model : ReplaceVariable = {
    definition: {
        handle: "readFile",
        usage: 'readFile[path\\to\\file.txt]',
        description: "テキストファイルの内容を読み込みます。",
        examples: [
            {
                usage: "readFile[path\\to\\file.txt, 1]",
                description: "指定した行番号を読み込みます。"
            },
            {
                usage: "readFile[path\\to\\file.txt, first]",
                description: "先頭行を読み込みます。"
            },
            {
                usage: "readFile[path\\to\\file.txt, first, true]",
                description: "先頭・末尾の空白行を除外してから先頭行を取得します。"
            },
            {
                usage: "readFile[path\\to\\file.txt, last]",
                description: "最終行を読み込みます。"
            },
            {
                usage: "readFile[path\\to\\file.txt, last, true]",
                description: "先頭・末尾の空白行を除外してから最終行を取得します。"
            },
            {
                usage: "readFile[path\\to\\file.txt, random]",
                description: "ランダムな行を読み込みます。"
            },
            {
                usage: "readFile[path\\to\\file.txt, random, true]",
                description: "先頭・末尾の空白行を除外してからランダムな行を取得します。"
            },
            {
                usage: "readFile[path\\to\\file.txt, array]",
                description: "テキストファイル全体を配列として読み込みます。"
            },
            {
                usage: "readFile[path\\to\\file.txt, array, true]",
                description: "先頭・末尾の空白行を除外してから配列を取得します。"
            },
            {
                usage: "readFile[path\\to\\file.ogg, bytes]",
                description: "ファイルの内容を読み込み、バイト配列として返します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text", "array"]
    },
    evaluator: async (
        trigger: Trigger,
        filePath: string,
        lineOrRandom: null | number | "array" | "first" | "last" | "random" | "bytes",
        ignoreWhitespace?: string | boolean
    ) : Promise<string | string[] | Uint8Array> => {

        if (filePath === null) {
            return "[ファイルパスエラー]";
        }

        if (lineOrRandom === "bytes") {
            try {
                return Uint8Array.from(await fs.readFile(filePath));
            } catch (err) {
                logger.error("Error reading binary file", err);
                return "[ファイル読み込みエラー]";
            }
        }

        let contents : string;
        try {
            contents = await fs.readFile(filePath, { encoding: "utf-8" });
        } catch (err) {
            logger.error("error reading file", err);
            return "[ファイル読み込みエラー]";
        }

        if (lineOrRandom == null || contents === '') {
            return contents;
        }

        let lines : string[];
        if (ignoreWhitespace === true || `${ignoreWhitespace}`.toLowerCase() === 'true') {
            lines = contents

                // remove leading and trailing whitespace (EOLs, spaces, tabs, etc)
                .trim()

                // Split based on new lines, consuming all whitespace around the new line character.
                // This effectively removes empty lines, lines containing only spaces and
                // leading/trailing spaces from each line
                .split(/[ \t\f]*[\r\n]\s*/g);

        } else {
            lines = contents.split(/[\r\n]+/g);
        }

        if (Number.isFinite(Number(lineOrRandom))) {
            if (Number(lineOrRandom) <= lines.length) {
                return lines[Number(lineOrRandom) - 1];
            }
            return '';
        }

        const lorStr = `${lineOrRandom}`.toLowerCase();
        if (lorStr === 'array') {
            return lines;
        }
        if (lorStr === 'first') {
            return lines[0];
        }
        if (lorStr === 'last') {
            return lines[lines.length - 1];
        }
        if (lorStr === 'true' || lorStr === 'random') {
            return lines[getRandomInt(0, lines.length - 1)];
        }
        return '';
    }
};

export default model;
