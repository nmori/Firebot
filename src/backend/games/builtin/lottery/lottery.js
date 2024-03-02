"use strict";

const LotteryCommand = require("./lottery-command");

/**
 * @type {import('../../game-manager').FirebotGame}
 */
module.exports = {
    id: "firebot-lottery",
    name: "抽選",
    subtitle: "抽選を行います",
    description: "「!lottery」と入力して、抽選に参加します",
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
                defaultWager: {
                    type: "number",
                    title: "参加金額",
                    description: "抽選に参加するのに必要な金額。",
                    placeholder: "金額を入れる",
                    tip: "必須",
                    sortRank: 2,
                    validation: {
                        min: 0,
                        required: true
                    }
                }
            }
        },
        lotterySettings: {
            title: "抽選設定",
            sortRank: 2,
            settings: {
                LotterySpec: {
                    type: "number",
                    title: "抽選数",
                    description: "何人抽選で選ぶかを決めます",
                    useTextArea: true,
                    default: 1,
                    tip: "1以上",
                    sortRank: 1,
                    validation: {
                        required: true,
                        min: 1
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
                alreadyLotteryning: {
                    type: "string",
                    title: "すでに、抽選中",
                    description: "抽選の指示が速すぎる場合（メッセージが不要な場合は空白にします）",
                    useTextArea: true,
                    default: "{displayName}さん、今抽選引いているところですよ",
                    tip: "有効な変数 variables: {username}, {displayName}",
                    sortRank: 1
                },
                onCooldown: {
                    type: "string",
                    title: "再実行までの待ち時間中",
                    description: "ユーザーが待ち時間を満了していない時（メッセージが不要な場合は空白にします）",
                    useTextArea: true,
                    default: "{displayName}さん, 再度抽選を引くまでの残り時間: {timeRemaining}",
                    tip: "有効な変数: {username}, {timeRemaining}, {displayName}",
                    sortRank: 2
                },               
                notEnough: {
                    type: "string",
                    title: "不十分",
                    description: "選択した金額を賭けるだけの十分な資金がない場合（メッセージなしの場合は空欄のまま）。",
                    useTextArea: true,
                    default: "{displayName}さん, 抽選を参加するための資金がたりません",
                    tip: "有効な変数: {username}, {displayName}",
                    sortRank: 8
                },
                LotteryInAction: {
                    type: "string",
                    title: "抽選に参加",
                    description: "抽選がに参加した時（メッセージなしの場合は空欄のまま）",
                    useTextArea: true,
                    default: "{displayName}さん、抽選にエントリーしました",
                    tip: "有効な変数: {username}, {displayName}",
                    sortRank: 9
                },
                LotterySuccessful: {
                    type: "string",
                    title: "抽選完了",
                    description: "抽選が終了した時（メッセージなしの場合は空欄のまま）",
                    useTextArea: true,
                    default: "■当選：{displayName}さん",
                    tip: "有効な変数: {username}, {displayName}",
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
        LotteryCommand.registerLotteryCommand();
    },
    onUnload: () => {
        LotteryCommand.unregisterLotteryCommand();
        LotteryCommand.purgeCaches();
    },
    onSettingsUpdate: () => {
        LotteryCommand.purgeCaches();
    }
};