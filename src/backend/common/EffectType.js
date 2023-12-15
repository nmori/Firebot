"use strict";

const Trigger = {
    COMMAND: "command",
    CUSTOM_SCRIPT: "custom_script",
    API: "api",
    EVENT: "event",
    HOTKEY: "hotkey",
    TIMER: "timer",
    SCHEDULED_TASK: "scheduled_task",
    COUNTER: "counter",
    CHANNEL_REWARD: "channel_reward",
    MANUAL: "manual"
};

const ALL_TRIGGERS = Object.values(Trigger);

const Dependency = {
    CHAT: "chat",
    OVERLAY: "overlay"
};

const effectDefinitions = [
    {
        id: "API_BUTTON",
        v5Id: "firebot:api",
        name: "APIボタン",
        triggers: ALL_TRIGGERS,
        dependencies: [Dependency.CHAT],
        description: "サードパーティのAPIから情報を引き出す"
    },
    {
        id: "CELEBRATION",
        v5Id: "firebot:celebration",
        name: "お祝い",
        triggers: ALL_TRIGGERS,
        dependencies: [Dependency.OVERLAY],
        description: "オーバーレイの楽しい演出"
    },
    {
        id: "CHAT",
        v5Id: "firebot:chat",
        name: "チャット",
        triggers: ALL_TRIGGERS,
        dependencies: [Dependency.CHAT],
        description: "チャットにメッセージを送る"
    },
    {
        id: "CUSTOM_SCRIPT",
        v5Id: "firebot:customscript",
        name: "スクリプト",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description: "独自のスクリプトを実行する"
    },
    {
        id: "RUN_COMMAND",
        v5Id: null,
        name: "コマンド実行",
        triggers: [
            Trigger.CUSTOM_SCRIPT,
            Trigger.API,
            Trigger.MANUAL,
            Trigger.HOTKEY
        ],
        dependencies: [],
        description: "別のトリガーを使ってコマンドを実行する"
    },
    {
        id: "DELAY",
        v5Id: "firebot:delay",
        name: "遅延",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description: "演出間の待ち時間"
    },
    {
        id: "DICE",
        v5Id: "firebot:dice",
        name: "サイコロ",
        triggers: ALL_TRIGGERS,
        dependencies: [Dependency.CHAT],
        description: "サイコロを振る"
    },
    {
        id: "GAME_CONTROL",
        v5Id: "firebot:controlemulation",
        name: "ゲーム制御",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description: "キーボードとマウスのクリックを操作"
    },
    {
        id: "HTML",
        v5Id: "firebot:html",
        name: "HTMLの表示",
        triggers: ALL_TRIGGERS,
        dependencies: [Dependency.OVERLAY],
        description: "オーバーレイにカスタムHTMLを表示する"
    },
    {
        id: "SHOW_EVENTS",
        v5Id: null,
        name: "イベント表示",
        triggers: ALL_TRIGGERS,
        dependencies: [Dependency.OVERLAY],
        description: "イベントをイベントリストに送る"
    },
    {
        id: "SEND-VRCHAT",
        v5Id: "firebot:send-vrchat",        
        name: "VRChatチャットに送付",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description: "ゆかコネNEO経由でVRChatチャットに送付"
    },
    {
        id: "ONECOMME-WORDPARTY",
        v5Id: "firebot:oneccome-wordparty",
        name: "わんコメ WordParty",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description: "わんコメのWordPartyを起動します"
    },
    {
        id: "ONECOMME-TRANSFER",
        v5Id: "firebot:oneccome-transfer",
        name: "わんコメへ転送",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description: "わんコメのチャット欄に転送します"
    },
    {
        id: "PLAY_SOUND",
        v5Id: "firebot:playsound",
        name: "サウンドを再生",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description: "音を再生する"
    },
    {
        id: "SPEECH_BOUYOMICHAN",
        v5Id: "firebot:playbouyomichan",
        name: "棒読みちゃんで再生",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description: "音を再生する"
    },    
    {
        id: "SPEECH_VOICEVOX",
        v5Id: "firebot:playvoicevox",
        name: "VOICEVOXで再生",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description: "VOICEVOXに直接指示し、音声合成で話す"
    }, 
    {
        id: "SPEECH_YNCNEO",
        v5Id: "firebot:play-yncneo",
        name: "音声を再生",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description: "ゆかコネNEO経由で音声合成をつかって話す"
    },
    {
        id: "RANDOM_EFFECT",
        v5Id: "firebot:randomeffect",
        name: "演出をランダム実行",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description: "効果のリストからランダム効果を実行する"
    },
    {
        id: "EFFECT_GROUP",
        v5Id: "firebot:run-effect-list",
        name: "演出グループ",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description:
      "複数の演出をグループ化し、1つの演出として扱う（ランダム演出の使用に適している）"
    },
    {
        id: "SHOW_IMAGE",
        v5Id: "firebot:showImage",
        name: "画像を表示",
        triggers: ALL_TRIGGERS,
        dependencies: [Dependency.OVERLAY],
        description: "オーバーレイに画像を表示する"
    },
    {
        id: "CREATE_CLIP",
        v5Id: "firebot:clip",
        name: "クリップを作成",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description: "Mixer上で指定した時間だけクリップを作成する指示をします"
    },
    {
        id: "SHOW_VIDEO",
        v5Id: "firebot:playvideo",
        name: "動作を再生",
        triggers: ALL_TRIGGERS,
        dependencies: [Dependency.OVERLAY],
        description: "オーバーレイでビデオを再生する"
    },
    {
        id: "CLEAR_EFFECTS",
        v5Id: null,
        name: "演出を消す",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description: "現在実行中の演出（サウンドとオーバーレイ演出）を終了する。"
    },
    {
        id: "TEXT_TO_FILE",
        v5Id: "firebot:filewriter",
        name: "テキストをファイルに書き込む",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description: "テキストをファイルに書き込む"
    },
    {
        id: "TRANSLATE",
        v5Id: "firebot:translate-yncneo",
        name: "翻訳を実行",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description: "ゆかコネNEO経由で翻訳"
    },    
    {
        id: "COMMAND_LIST",
        v5Id: null,
        name: "コマンドリスト",
        triggers: [Trigger.COMMAND],
        dependencies: [Dependency.CHAT],
        description: "チャットコマンドリストを返答します"
    },
    {
        id: "TOGGLE_CONNECTION",
        v5Id: "firebot:toggleconnection",
        name: "接続状態を切替える",
        triggers: ALL_TRIGGERS,
        dependencies: [],
        description: "Mixerサービスへの接続を切り替えます。"
    },
    {
        id: "SHOW_TEXT",
        v5Id: "firebot:showtext",
        name: "テキストを表示",
        triggers: ALL_TRIGGERS,
        dependencies: [Dependency.OVERLAY],
        description: "テキストをオーバーレイに表示します。"
    }
];

function getEffects(triggerType) {
    // filter effects list to given triggerType
    const filteredEffects = effectDefinitions.filter(e => {
        if (triggerType != null) {
            return e.triggers[triggerType] != null && e.triggers[triggerType] !== false;
        }
        return true;
    });
    return filteredEffects;
}

function generateEffectObjects(triggerType, triggerMeta, useV5Ids = false) {
    const effectsObject = {};
    const filteredEffects = getEffects(triggerType, triggerMeta);
    filteredEffects.forEach(e => {
        effectsObject[e.id] = useV5Ids ? e.v5Id : e.name;
    });
    return effectsObject;
}

function getEffectByName(effectName) {
    const effect = effectDefinitions.filter(e => e.name === effectName);
    if (effect.length < 1) {
        return null;
    }
    return effect[0];
}

function getEffectById(effectId) {
    const effect = effectDefinitions.filter(e => e.id === effectId);
    if (effect.length < 1) {
        return null;
    }
    return effect[0];
}

function getTriggerTypesForEffect(effectName) {
    const effect = getEffectByName(effectName);
    if (effect == null) {
        return null;
    }
    return effect.triggers;
}

function getDependenciesForEffect(effectName) {
    const effect = getEffectByName(effectName);
    if (effect == null) {
        return null;
    }
    return effect.dependencies;
}

// Generate 'Enum' objects for all effects
const EffectType = generateEffectObjects();

//export types
exports.DependencyType = Dependency;
exports.TriggerType = Trigger;
exports.EffectType = EffectType;
exports.EffectTypeV5Map = generateEffectObjects(null, null, true);

//export helper functions
exports.getEffectDefinitions = getEffects;
exports.getTriggerTypesForEffect = getTriggerTypesForEffect;
exports.getEffectByName = getEffectByName;
exports.getDependenciesForEffect = getDependenciesForEffect;
exports.getEffectById = getEffectById;

exports.effectCanBeTriggered = function(effectName, triggerType) {
    const triggerTypes = getTriggerTypesForEffect(effectName);
    if (triggerTypes == null) {
        return false;
    }

    return triggerTypes.includes(triggerType);
};

exports.getEffectDictionary = generateEffectObjects;

exports.getAllEffectTypes = function(triggerType, triggerMeta) {
    // if triggerType is null, all effects are returned
    const effects = getEffects(triggerType, triggerMeta);

    //map to just an array of names and return
    return effects.map(e => e.name);
};

exports.getEffect = function(effectIdOrName) {
    const effects = effectDefinitions.filter(
        e => e.id === effectIdOrName || e.name === effectIdOrName
    );

    if (effects.length < 1) {
        return null;
    }

    return effects[0];
};
