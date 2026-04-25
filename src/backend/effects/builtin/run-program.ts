import nodeProcess from "process";
import path from "path";
import { ChildProcess, spawn } from "child_process";

import type { EffectType } from "../../../types/effects";

import logger from "../../logwrapper";

const splitArgumentsText = (argsString: string) => {
    const re = /^"[^"]*"$/; // Check if argument is surrounded with double-quotes
    const re2 = /^([^"]|[^"].*?[^"])$/; // Check if argument is NOT surrounded with double-quotes

    const arr: string[] = [];
    let argPart: string = null;

    if (argsString) {
        argsString.split(" ").forEach(function (arg) {
            if ((re.test(arg) || re2.test(arg)) && !argPart) {
                arr.push(arg);
            } else {
                argPart = argPart ? `${argPart} ${arg}` : arg;
                // If part is complete (ends with a double quote), we can add it to the array
                if (/"$/.test(argPart)) {
                    arr.push(argPart.replace(/^"/, "").replace(/"$/, ""));
                    argPart = null;
                }
            }
        });
    }

    return arr;
};

const effect: EffectType<{
    programPath: string;
    programArgs: string;
    waitForFinish: boolean;
    hideWindow: boolean;
    runDetached: boolean;
}> = {
    definition: {
        id: "firebot:run-program",
        name: "プログラム実行",
        description: "プログラムまたは実行ファイルを実行します",
        icon: "fad fa-terminal",
        categories: ["advanced", "scripting"],
        dependencies: [],
        outputs: [
            {
                label: "プログラムの出力",
                description: "プログラムの生の出力結果",
                defaultName: "programResponse"
            }
        ]
    },
    optionsTemplate: `
        <eos-container header="プログラムのファイルパス">
            <file-chooser model="effect.programPath" options="fileChooserOptions"></file-chooser>
        </eos-container>
        <eos-container header="プログラム引数（任意）" pad-top="true">
            <div class="input-group">
                <span class="input-group-addon" id="delay-length-effect-type">引数</span>
                <input ng-model="effect.programArgs" type="text" class="form-control" type="text" replace-variables menu-position="bottom">
            </div>
        </eos-container>
        <eos-container header="オプション" pad-top="true">
            <div style="padding-top:15px">
                <label class="control-fb control--checkbox"> プログラムの終了を待つ
                    <input type="checkbox" ng-model="effect.waitForFinish">
                    <div class="control__indicator"></div>
                </label>
            </div>

            <div style="padding-top:15px">
                <label class="control-fb control--checkbox"> ウィンドウを非表示
                    <input type="checkbox" ng-model="effect.hideWindow">
                    <div class="control__indicator"></div>
                </label>
            </div>

            <div style="padding-top:15px">
                <label class="control-fb control--checkbox"> デタッチモードで実行
                    <input type="checkbox" ng-model="effect.runDetached">
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>
    `,
    optionsController: ($scope) => {
        if ($scope.effect.hideWindow == null) {
            $scope.effect.hideWindow = true;
        }
        if ($scope.effect.runDetached == null) {
            $scope.effect.runDetached = true;
        }

        // Windows defaults
        let programName = "プログラム";
        let programExtensions = ["exe", "bat", "com"];

        if (process.platform === "linux") {
            programName = "シェルスクリプト";
            programExtensions = ["sh"];
        } else if (process.platform === "darwin") {
            programName = "アプリ/スクリプト";
            programExtensions = ["app", "command", "tool", "sh", "scpt", "scptd"];
        }

        $scope.fileChooserOptions = {
            filters: [
                { name: programName, extensions: programExtensions },
                { name: "すべてのファイル", extensions: ['*'] }
            ]
        };
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.programPath == null) {
            errors.push("実行するプログラムを選択してください。");
        }
        return errors;
    },
    getDefaultLabel: (effect) => {
        return effect.programPath ?? "プログラム未選択";
    },
    onTriggerEvent: async ({ effect }) => {
        return new Promise((resolve) => {
            let { programPath } = effect;
            const { programArgs, waitForFinish, hideWindow, runDetached } = effect;

            if (programPath == null || programPath === "") {
                return resolve();
            }

            const useShell = programPath.toLowerCase().endsWith(".bat") || programPath.toLowerCase().endsWith(".cmd");

            const options: Record<string, unknown> = {
                cwd: path.dirname(programPath),
                windowsHide: hideWindow,
                shell: useShell
            };

            if (!waitForFinish) {
                options.detached = runDetached !== false; // catch null and true as valid for backwards compat
                options.stdio = "ignore";
            }

            let args: string[] = [];
            const argString = programArgs;
            if (argString != null && argString.length > 0) {
                args = splitArgumentsText(argString);
            }

            if (useShell && nodeProcess.platform === "win32" && programPath.indexOf(" ") !== -1) {
                // When using shell, we must properly escape the command
                programPath = `"${programPath}"`;
            }

            let child: ChildProcess;
            try {
                child = spawn(programPath, args, options);
            } catch (err) {
                try {
                    child.kill();
                } catch { }
                logger.warn("Failed to spawn program:", err, programPath, args, options);
                return resolve();
            }

            if (!waitForFinish) {
                child.unref();
                return resolve();
            }

            let stdoutData = "";
            if (child.stdout) {
                child.stdout.on("data", (data) => {
                    logger.debug(`stdout: ${data}`);
                    stdoutData += data;
                });

                child.stderr.on("data", (data) => {
                    logger.debug(`stderr: ${data}`);
                });
            }

            child.on("error", function (err) {
                logger.warn(`spawned program error:`, err, programPath, args, options);
                child.kill();
                return resolve();
            });

            child.on("close", (code) => {
                logger.debug(`Spawned program exited with code ${code}`);
                resolve({
                    success: true,
                    outputs: {
                        programResponse: stdoutData
                    }
                });
            });
        });
    }
};

export = effect;