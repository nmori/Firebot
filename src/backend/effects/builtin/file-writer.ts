import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { EffectType } from "../../../types/effects";
import logger from "../../logwrapper";

async function doesTextExistInFile(filepath: string, text: string): Promise<boolean> {
    const contents = await fsp.readFile(filepath, { encoding: "utf8" });
    return contents.includes(text);
}

async function removeLines(filepath: string, lines: number[] = []): Promise<string> {
    const contents = await fsp.readFile(filepath, { encoding: "utf8" });
    return `${contents
        .split('\n')
        .filter(l => l != null && l.trim() !== "")
        .filter((_, index) => !lines.includes(index))
        .join('\n')}\n`;
}

async function removeLinesWithText(filepath: string, text: string): Promise<string> {
    const contents = await fsp.readFile(filepath, { encoding: "utf8" });
    return `${contents
        .split('\n')
        .map((l) => {
            return l.replace('\r', "");
        })
        .filter(l => l != null && l.trim() !== "")
        .filter(l => l !== text)
        .join('\n')}\n`;
}

async function replaceLines(
    filepath: string,
    lineNumbers: number[] = [],
    replacement: string
): Promise<string> {
    const contents = await fsp.readFile(filepath, { encoding: "utf8" });

    return `${contents
        .split('\n')
        .filter(l => l != null && l.trim() !== "")
        .map((l, index) => {
            return lineNumbers.includes(index) ? replacement : l;
        })
        .join('\n')}\n`;
}

async function replaceLinesWithText(
    filepath: string,
    text: string,
    replacement: string
): Promise<string> {
    const contents = await fsp.readFile(filepath, { encoding: "utf8" });
    return `${contents
        .split('\n')
        .map((l) => {
            return l.replace('\r', "");
        })
        .filter(l => l != null && l.trim() !== "")
        .map((l) => {
            return l === text ? replacement : l;
        })
        .join('\n')}\n`;
}

const fileWriter: EffectType<{
    filepath: string;
    writeMode: "replace" | "suffix" | "append" | "delete" | "replace-line" | "delete-all";
    deleteLineMode: "lines" | "text";
    replaceLineMode: "lineNumbers" | "text";
    lineNumbers: string;
    text: string;
    dontRepeat: boolean;
    replacementText: string;
}> = {
    definition: {
        id: "firebot:filewriter",
        name: "ファイル書き込み",
        description: "ファイル内のテキストを書き込みまたは削除します。",
        icon: "fad fa-file-edit",
        categories: ["advanced"],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container header="ファイル">
            <file-chooser model="effect.filepath" options="{ filters: [ {name:'Text',extensions:['txt']}, {name:'All files',extensions:['*']} ]}"></file-chooser>
        </eos-container>

        <eos-container header="書き込みモード" pad-top="true">
            <div class="controls-fb" style="padding-bottom: 5px;">
                <label class="control-fb control--radio">置換   <tooltip text="'ファイル内の既存テキストを新しいテキストで置き換えます。'"></tooltip>
                    <input type="radio" ng-model="effect.writeMode" value="replace"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio">末尾追記 <tooltip text="'ファイルの末尾にテキストをそのまま追記します。'"></tooltip>
                    <input type="radio" ng-model="effect.writeMode" value="suffix"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio">改行して追記 <tooltip text="'指定したテキストを新しい行として追記します。'"></tooltip>
                    <input type="radio" ng-model="effect.writeMode" value="append"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio">行を削除 <tooltip text="'ファイル内の特定の行を削除します。'"></tooltip>
                    <input type="radio" ng-model="effect.writeMode" value="delete"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio">行を置換 <tooltip text="'ファイル内の特定の行を置き換えます。'"></tooltip>
                    <input type="radio" ng-model="effect.writeMode" value="replace-line"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio">ファイルをクリア <tooltip text="'ファイル内のすべてのテキストを消去します。'"></tooltip>
                    <input type="radio" ng-model="effect.writeMode" value="delete-all"/>
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>

        <eos-container header="追記オプション" pad-top="true" ng-if="effect.writeMode === 'append'">
            <label class="control-fb control--checkbox"> 重複しない <tooltip text="'同じテキストがファイル内に既に存在する場合は新しい行を追記しません。'"></tooltip>
                <input type="checkbox" ng-model="effect.dontRepeat">
                <div class="control__indicator"></div>
            </label>
        </eos-container>

        <eos-container header="行削除オプション" pad-top="true" ng-if="effect.writeMode === 'delete'">
            <div class="controls-fb" style="padding-bottom: 5px;">
                <label class="control-fb control--radio">行番号で削除 <tooltip text="'指定した行番号の行を削除します。'"></tooltip>
                    <input type="radio" ng-model="effect.deleteLineMode" value="lines"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio">テキストで削除 <tooltip text="'指定したテキストと一致する行を削除します。'"></tooltip>
                    <input type="radio" ng-model="effect.deleteLineMode" value="text"/>
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>

        <eos-container header="行置換オプション" pad-top="true" ng-if="effect.writeMode === 'replace-line'">
            <div class="controls-fb" style="padding-bottom: 5px;">
                <label class="control-fb control--radio">行番号で置換 <tooltip text="'指定した行番号の行を置き換えます。'"></tooltip>
                    <input type="radio" ng-model="effect.replaceLineMode" value="lineNumbers"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio">テキストで置換 <tooltip text="'指定したテキストと一致する行を置き換えます。'"></tooltip>
                    <input type="radio" ng-model="effect.replaceLineMode" value="text"/>
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>

        <eos-container header="テキスト" pad-top="true" ng-if="effect.writeMode === 'replace' || effect.writeMode === 'suffix' || effect.writeMode === 'append' || (effect.writeMode === 'delete' && effect.deleteLineMode === 'text') || (effect.writeMode === 'replace-line' && effect.replaceLineMode === 'text')">
            <firebot-input model="effect.text" type="text" placeholder-text="テキストを入力" use-text-area="true"></firebot-input>
        </eos-container>

        <eos-container header="行番号" pad-top="true" ng-if="(effect.writeMode === 'delete' && effect.deleteLineMode === 'lines') || (effect.writeMode === 'replace-line' && effect.replaceLineMode === 'lineNumbers')">
            <p class="muted">{{effect.writeMode === 'delete' ? '削除' : '置換'}}したい行番号を入力します。複数行はカンマ区切りで指定できます。</p>
            <input ng-model="effect.lineNumbers" type="text" class="form-control" id="chat-line-numbers-setting" placeholder="行番号を入力" replace-variables="number">
        </eos-container>

        <eos-container header="置換後のテキスト" pad-top="true" ng-if="effect.writeMode === 'replace-line'">
            <firebot-input model="effect.replacementText" type="text" placeholder-text="テキストを入力" use-text-area="true"></firebot-input>
        </eos-container>
    `,
    optionsController: ($scope) => {
        if ($scope.effect.writeMode == null) {
            $scope.effect.writeMode = "replace";
        }

        if ($scope.effect.deleteLineMode == null) {
            $scope.effect.deleteLineMode = "lines";
        }

        if ($scope.effect.replaceLineMode == null) {
            $scope.effect.replaceLineMode = "lineNumbers";
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.filepath == null || effect.filepath === "") {
            errors.push("書き込み対象のテキストファイルを選択してください。");
        }
        if (effect.writeMode === 'delete' && (effect.deleteLineMode === 'lines' && (effect.lineNumbers == null || effect.lineNumbers === ""))) {
            errors.push("削除する行の行番号を指定してください。");
        }
        if (effect.writeMode === 'delete' && (effect.deleteLineMode === 'text' && (effect.text == null || effect.text === ""))) {
            errors.push("削除する行のテキストを指定してください。");
        }
        if (effect.writeMode === 'replace-line' && (effect.replaceLineMode === 'lineNumbers' && (effect.lineNumbers == null || effect.lineNumbers === ""))) {
            errors.push("置換する行の行番号を指定してください。");
        }
        if (effect.writeMode === 'replace-line' && (effect.replaceLineMode === 'text' && (effect.text == null || effect.text === ""))) {
            errors.push("置換する行のテキストを指定してください。");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect }) => {
        if (effect == null || effect.filepath == null) {
            return;
        }

        let text = effect.text || "";
        let escapedNewline = "␚";
        while (text.includes(escapedNewline)) {
            escapedNewline = `␚${randomUUID()}␚`;
        }
        text = text.replace(/\\\\n/g, escapedNewline);
        text = effect.writeMode === "suffix" ? text.replace(/\\n/g, "\n") : text.replace(/\\n/g, "\n").trim();
        text = text.replaceAll(escapedNewline, "\\n");

        try {
            switch (effect.writeMode) {
                case "suffix":
                    await fsp.appendFile(effect.filepath, text, { encoding: "utf8" });
                    break;

                case "append":
                    if (fs.existsSync(effect.filepath) && effect.dontRepeat) {
                        if (!await doesTextExistInFile(effect.filepath, text)) {
                            await fsp.appendFile(effect.filepath, `${text}\n`, { encoding: "utf8" });
                        }
                    } else {
                        await fsp.mkdir(path.dirname(effect.filepath), { recursive: true });
                        await fsp.appendFile(effect.filepath, `${text}\n`, { encoding: "utf8" });
                    }
                    break;

                case "delete":
                    if (effect.deleteLineMode === 'lines' || effect.deleteLineMode == null) {
                        const lines = effect.lineNumbers
                            .split(",")
                            .map(l => l.trim())
                            .filter(l => !isNaN(Number(l)))
                            .map(l => parseInt(l, 10) - 1);

                        await fsp.writeFile(effect.filepath, await removeLines(effect.filepath, lines), { encoding: "utf8" });
                    } else if (effect.deleteLineMode === 'text') {
                        await fsp.writeFile(effect.filepath, await removeLinesWithText(effect.filepath, effect.text), { encoding: "utf8" });
                    }
                    break;

                case "replace-line":
                    if (effect.replaceLineMode === 'lineNumbers' || effect.replaceLineMode == null) {
                        const lines = effect.lineNumbers
                            .split(",")
                            .map(l => l.trim())
                            .filter(l => !isNaN(Number(l)))
                            .map(l => parseInt(l, 10) - 1);

                        await fsp.writeFile(effect.filepath, await replaceLines(effect.filepath, lines, effect.replacementText), { encoding: "utf8" });
                    } else if (effect.replaceLineMode === 'text') {
                        await fsp.writeFile(effect.filepath, await replaceLinesWithText(effect.filepath, effect.text, effect.replacementText), { encoding: "utf8" });
                    }
                    break;

                case "delete-all":
                    await fsp.writeFile(effect.filepath, "", { encoding: "utf8" });
                    break;

                default: // Replace (overwrite)
                    await fsp.writeFile(effect.filepath, text, { encoding: "utf8" });
                    break;
            }
        } catch (err) {
            logger.warn("Failed to write to file", err);
            return false;
        }

        return true;
    }
};

export = fileWriter;