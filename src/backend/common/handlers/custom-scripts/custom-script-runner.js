"use strict";
const { ipcMain, shell } = require("electron");
const uuid = require("uuid/v4");
const logger = require("../../../logwrapper");
const { settings } = require("../../settings-access");
const utils = require("../../../utility");
const profileManager = require("../../profile-manager");
const { getScriptPath, buildRunRequest, mapParameters, mapV4EffectToV5 } = require("./custom-script-helpers");
const effectRunner = require("../../effect-runner.js");

/**
 * @typedef { import('./script-types').ScriptData } ScriptData
 * @typedef { import('./script-types').CustomScript } CustomScript
 * @typedef { import('./script-types').Trigger } Trigger
 */

/**
 * @type {Record<string, CustomScript>}
 */
const activeCustomScripts = {};

/**
 *
 * @param {ScriptData} scriptData
 * @param {Trigger} trigger
 */
async function executeScript(scriptData, trigger, isStartupScript = false) {
    const { scriptName, parameters } = scriptData;

    const scriptFilePath = getScriptPath(scriptName);

    // Attempt to load the script
    /**
     * @type {CustomScript}
     */
    let customScript;
    try {
        // Make sure we first remove the cached version, incase there was any changes
        if (settings.getClearCustomScriptCache()) {
            delete require.cache[require.resolve(scriptFilePath)];
        }
        customScript = require(scriptFilePath);
    } catch (error) {
        renderWindow.webContents.send("error", `${scriptName}'を読み込めません \n\n ${error}`);
        logger.error(error);
        return;
    }

    // Verify the script contains the "run" function
    if (typeof customScript.run !== "function") {
        renderWindow.webContents.send(
            "error",
            `'${scriptName}'を実行できません。スクリプトに 'run' 関数が含まれていません。`
        );
        return;
    }

    const manifest = {
        name: "不明なスクリプト",
        version: "不明なバージョン",
        startupOnly: false
    };

    // set manifest values if they exist
    if (customScript.getScriptManifest) {
        const scriptManifest = customScript.getScriptManifest();
        if (scriptManifest) {
            manifest.name = scriptManifest.name || manifest.name;
            manifest.version = scriptManifest.version || manifest.version;
            manifest.startupOnly = scriptManifest.startupOnly;
        }
    }

    if (manifest.startupOnly && !isStartupScript) {
        renderWindow.webContents.send(
            "error",
            `スクリプト「${manifest.name}」はスタートアップ専用スクリプトです。Firebotのスタートアップ以外では実行できません。`
        );
        return;
    }

    const runRequest = buildRunRequest(manifest, mapParameters(parameters), trigger || {});

    // wait for script to finish for a maximum of 10 secs
    let response;
    try {
        response = await Promise.race([Promise.resolve(customScript.run(runRequest)), utils.wait(10 * 1000)]);
    } catch (error) {
        logger.error(`Error while running script '${scriptName}'`, error);
        return;
    }

    if (response == null || typeof response !== "object") {
        return;
    }

    if (!response.success) {
        logger.error("Script failed with message:", response.errorMessage);
        renderWindow.webContents.send("error", "スクリプトの実行に失敗しました： " + response.errorMessage);
        return;
    }

    if (typeof response.callback !== "function") {
        response.callback = () => {};
    }

    const effects = response.effects;
    if (effects == null) {
        return;
    }

    const effectsIsArray = Array.isArray(effects);

    let effectsObj;
    if (!effectsIsArray && effects.list != null) {
        effectsObj = effects;
    } else if (effectsIsArray) {
        effectsObj = {
            id: uuid(),
            list: effects
                .filter((e) => e.type != null && e.type !== "")
                .map((e) => {
                    e = mapV4EffectToV5(e);
                    if (e.id == null) {
                        e.id = uuid();
                    }
                    return e;
                })
        };

        const clonedTrigger = JSON.parse(JSON.stringify(trigger || {}));

        const processEffectsRequest = {
            trigger: clonedTrigger,
            effects: effectsObj
        };

        try {
            const runResult = await effectRunner.processEffects(processEffectsRequest);

            response.callback("effects");

            if (runResult != null && runResult.success === true) {
                if (runResult.stopEffectExecution) {
                    return {
                        success: true,
                        execution: {
                            stop: true,
                            bubbleStop: true
                        }
                    };
                }
            }
        } catch (error) {
            logger.error("Error running effects for script", error);
        }
    }
}

/**
 * @param {ScriptData} startUpScriptConfig
 */
async function runStartUpScript(startUpScriptConfig) {
    const { scriptName } = startUpScriptConfig;
    logger.debug(`running startup script: ${scriptName}`);

    if (!settings.isCustomScriptsEnabled()) {
        logger.warn("Attempted to run startup script but custom scripts are disabled.");
        return;
    }

    try {
        await executeScript(startUpScriptConfig, null, true);
    } catch (error) {
        logger.error(`Failed to run startup script '${scriptName}'`, error);
    }
}

/**
 * @param {ScriptData} startUpScriptConfig
 */
async function startUpScriptSaved(startUpScriptConfig) {
    const activeScript = activeCustomScripts[startUpScriptConfig.id];
    if (activeScript == null) {
        runStartUpScript(startUpScriptConfig);
        return;
    }
    if (activeScript.parametersUpdated) {
        activeScript.parametersUpdated(mapParameters(startUpScriptConfig.parameters));
    }
}

/**
 * @param {ScriptData} startUpScriptConfig
 */
async function startUpScriptDeleted(startUpScriptConfig) {
    const activeScript = activeCustomScripts[startUpScriptConfig.id];
    if (activeScript == null) {
        return;
    }
    if (activeScript.stop != null) {
        try {
            await Promise.resolve(activeScript.stop());
        } catch (error) {
            logger.error(`Error when attempting to stop custom script`, error);
        }
    }
    const scriptFilePath = getScriptPath(startUpScriptConfig.scriptName);
    try {
        delete require.cache[require.resolve(scriptFilePath)];
    } catch (error) {
        logger.error(`Error when attempting to remove script from memory`, error);
    }
}

/**
 *
 * @param {ScriptData} effect
 * @param {Trigger} trigger
 */
function runScript(effect, trigger) {
    const { scriptName } = effect;

    logger.debug(`running script: ${scriptName}`);

    if (!settings.isCustomScriptsEnabled()) {
        renderWindow.webContents.send(
            "error",
            "スクリプトの実行を試みましたが、この機能は無効化されており実行できません"
        );
        return;
    }

    return executeScript(effect, trigger);
}

ipcMain.on("openScriptsFolder", function () {
    shell.openPath(profileManager.getPathInProfile("/scripts"));
});

exports.runScript = runScript;
exports.runStartUpScript = runStartUpScript;
exports.startUpScriptSaved = startUpScriptSaved;
exports.startUpScriptDeleted = startUpScriptDeleted;
