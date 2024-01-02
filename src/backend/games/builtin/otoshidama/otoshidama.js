"use strict";

const OmikujiCommand = require("./otoshidama-command");

/**
 * @type {import('../../game-manager').FirebotGame}
 */
module.exports = {
    id: "firebot-otoshidama",
    name: "お年玉",
    subtitle: "お年玉ちょうだい！",
    description: "「!otoshidama」と入力して、お年玉をもらいます。",
    icon: "fa-solid fa-ticket",
    settingCategories: {
        currencySettings: {
            title: "通貨設定",
            sortRank: 1,
            settings: {
                currencyId: {
                    type: "currency-select",
                    title: "通貨",
                    description: "このゲームで使用する通貨",
                    sortRank: 1,
                    validation: {
                        required: true
                    }
                },
                OmikujiSpec: {
                    type: "string",
                    title: "お年玉の額",
                    description: "金額をいれます",
                    useTextArea: true,
                    default: "1\n100\n200\n500\n1000",
                    tip: "２つ以上いれましょう",
                    sortRank: 1,
                    validation: {
                        min: 0,
                        required: true
                    }
                }
            }
        },
        cooldownSettings: {
            title: "再実行までの待ち時間",
            sortRank: 3,
            settings: {
                cooldown: {
                    type: "number",
                    title: "待ち時間 (秒)",
                    placeholder: "時間を入れる",
                    tip: "待ち時間は視聴者ごとに適用されます",
                    default: 300,
                    validation: {
                        min: 0
                    }
                }
            }
        },
        generalMessages: {
            title: "一般メッセージ",
            sortRank: 5,
            settings: {
                alreadyOmikujining: {
                    type: "string",
                    title: "すでに、お年玉おねだり中",
                    description: "お年玉のおねだりが速すぎる場合（メッセージが不要な場合は空白にします）",
                    useTextArea: true,
                    default: "{displayName}さん、せっかちですよ",
                    tip: "有効な変数 variables: {username},{displayName}",
                    sortRank: 1
                },
                onCooldown: {
                    type: "string",
                    title: "再実行までの待ち時間中",
                    description: "ユーザーが待ち時間を満了していない時（メッセージが不要な場合は空白にします）",
                    useTextArea: true,
                    default: "{displayName}さん, さっきもらったじゃないですか～: {timeRemaining}",
                    tip: "有効な変数: {username}, {timeRemaining},{displayName}",
                    sortRank: 2
                },               
                OmikujiSuccessful: {
                    type: "string",
                    title: "お年玉完了",
                    description: "お年玉を渡した時（メッセージなしの場合は空欄のまま）",
                    useTextArea: true,
                    default: "{displayName}さん、お年玉差し上げます！ （{otoshidamaResult} {currencyName}）",
                    tip: "有効な変数: {username}, {otoshidamaResult}, {displayName}, {currencyName}",
                    sortRank: 10
                }
            }
        },
        chatSettings: {
            title: "チャット設定",
            sortRank: 6,
            settings: {
                chatter: {
                    type: "chatter-select",
                    title: "アカウント"
                }
            }
        }
    },
    onLoad: () => {
        OmikujiCommand.registerOmikujiCommand();
    },
    onUnload: () => {
        OmikujiCommand.unregisterOmikujiCommand();
        OmikujiCommand.purgeCaches();
    },
    onSettingsUpdate: () => {
        OmikujiCommand.purgeCaches();
    }
};