"use strict";

const logger = require("../../logwrapper");

const { IncompatibilityError } = require("./import-helpers").errors;

const uuid = require("uuid/v1");

//v4 effect types are keys, supported v5 types are values
const v4EffectTypeMap = {
    "API Button": "firebot:api",
    "Celebration": "firebot:celebration",
    "Change Group": null, // v5 is fundamentally different here, cant import
    "Change Scene": null, // v5 is fundamentally different here, cant import
    "Chat": "firebot:chat",
    "Cooldown": null, // vastly different than v5 equivalent, extremely difficult to import correctly
    "Custom Script": "firebot:customscript",
    "Run Command": null, // was only available to custom scripts in v4, dont think it will even show up
    "Delay": "firebot:delay",
    "Dice": "firebot:dice",
    "Game Control": "firebot:controlemulation",
    "HTML": "firebot:html",
    "Show Event": null, // going to deprecate the v5 equivalent so not going to bother importing
    "Play Sound": "firebot:playsound",
    "Random Effect": "firebot:randomeffect",
    "Effect Group": "firebot:run-effect-list",
    "Show Image": "firebot:showImage",
    "Create Clip": "firebot:clip",
    "Show Video": "firebot:playvideo",
    "Clear Effects": null,
    "Write Text To File": "firebot:filewriter",
    "Group List": null,
    "Scene List": null,
    "Command List": null, // v5 equivalent doesnt exist as theres a sys cmd for this now
    "Change User Scene": null,
    "Change Group Scene": null,
    "Update Button": null, // vastly different than v5 equivalent, extremely difficult to import correctly
    "Toggle Connection": "firebot:toggleconnection",
    "Show Text": "firebot:showtext"
};

const v4IncompatibilityReasonMap = {
    "Change Group": "V5はグループ／シーンの扱いが根本的に異なります",
    "Change Scene": "V5はグループ／シーンの扱いが根本的に異なります",
    "Cooldown": "V5は再実行までの待ち（クールダウン）の扱いが根本的に違う",
    "Run Command": "この演出は取り込めません",
    "Show Event": "この演出のサポートは終了しました",
    "Clear Effects": "V5では演出の考え方が根本的に異なります",
    "Group List": "V5はグループ／シーンの扱いが根本的に異なります",
    "Scene List": "V5はグループ／シーンの扱いが根本的に異なります",
    "Command List": "この機能はシステムコマンドとして存在するため、演出としての設定はありません。",
    "Change User Scene": "V5はグループ／シーンの扱いが根本的に異なります",
    "Change Group Scene": "V5はグループ／シーンの扱いが根本的に異なります",
    "Update Button": "V5ではコントロールの更新の仕方が根本的に異なります"
};

function updateReplaceVariables(effect) {
    if (effect == null) {
        return effect;
    }

    const keys = Object.keys(effect);

    for (const key of keys) {
        const value = effect[key];

        if (value && typeof value === "string") {
            effect[key] = value.replace(/\$\(user\)/, "$user");
        } else if (value && typeof value === "object") {
            effect[key] = updateReplaceVariables(value);
        }
    }

    return effect;
}

function mapV4Effect (v4Effect, triggerData, incompatibilityWarnings) {
    if (v4Effect == null || v4Effect.type == null) {
        throw new IncompatibilityError("v4の演出設定が正しいフォーマットで設定されていません。");
    }
    const v5EffectTypeId = v4EffectTypeMap[v4Effect.type];

    // Null signifies we dont support this v4 effect
    if (v5EffectTypeId == null) {
        const reason = v4IncompatibilityReasonMap[v4Effect.type] || "不明な演出";
        throw new IncompatibilityError(reason);
    }

    let v5Effect = v4Effect;
    v5Effect.type = v5EffectTypeId;
    v5Effect.id = uuid();

    //do any per effect type tweaks here
    if (v5Effect.type === "firebot:playsound") {
        v5Effect.filepath = v5Effect.file;
    }

    if (v5Effect.type === "firebot:randomeffect" || v5Effect.type === "firebot:run-effect-list") {

        const mapResult = exports.mapV4EffectList(v5Effect.effectList, triggerData);

        mapResult.incompatibilityWarnings.forEach(iw => incompatibilityWarnings.push(iw));

        v5Effect.effectList = mapResult.effects;
    }

    v5Effect = updateReplaceVariables(v5Effect);

    return v5Effect;
}

exports.mapV4EffectList = (v4EffectList, triggerData) => {
    const incompatibilityWarnings = [];

    if (v4EffectList == null) {
        return { effects: null, incompatibilityWarnings: incompatibilityWarnings};
    }

    // v4 effect lists can be objects or arrays
    const v4Effects = Array.isArray(v4EffectList) ? v4EffectList : Object.values(v4EffectList);

    const v5EffectObj = {
        id: uuid(),
        list: []
    };

    for (const v4Effect of v4Effects) {
        if (v4Effect == null || v4Effect.type == null) {
            continue;
        }
        try {
            const mappedV5Effect = mapV4Effect(v4Effect, triggerData, incompatibilityWarnings);
            if (mappedV5Effect) {
                v5EffectObj.list.push(mappedV5Effect);
            }
        } catch (error) {
            let reason;
            if (error instanceof IncompatibilityError) {
                reason = error.reason;
            } else {
                logger.warn("Error during v4 effect import", error);
                reason = "予期せぬエラーが発生しました";
            }
            const message = `V4の演出を取り込めません：  ${triggerData.type} の'${v4Effect.type}' '${triggerData.name}' 。理由: ${reason}`;
            incompatibilityWarnings.push(message);
        }
    }

    return {
        effects: v5EffectObj,
        incompatibilityWarnings: incompatibilityWarnings
    };
};