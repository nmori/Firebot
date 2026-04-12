import type { FirebotGame } from "../../../../types/games";
import lotteryCommand from "./lottery-command";

const game: FirebotGame = {
    id: "firebot-lottery",
    name: "抽選",
    subtitle: "抽選を行います",
    description: "!lottery と入力して、抽選に参加します",
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
                    description: "抽選参加に必要な金額",
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
                    description: "当選人数を指定します",
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
                    title: "すでに抽選中",
                    description: "抽選指示が速すぎる場合（不要なら空欄）",
                    useTextArea: true,
                    default: "{displayName}さん、今抽選中です",
                    tip: "有効な変数: {username}, {displayName}",
                    sortRank: 1
                },
                onCooldown: {
                    type: "string",
                    title: "再実行までの待ち時間中",
                    description: "ユーザーが待ち時間中のとき（不要なら空欄）",
                    useTextArea: true,
                    default: "{displayName}さん, 再度抽選を引くまでの残り時間: {timeRemaining}",
                    tip: "有効な変数: {username}, {timeRemaining}, {displayName}",
                    sortRank: 2
                },
                notEnough: {
                    type: "string",
                    title: "不十分",
                    description: "参加資金が足りない場合（不要なら空欄）",
                    useTextArea: true,
                    default: "{displayName}さん, 抽選に参加するための資金が足りません",
                    tip: "有効な変数: {username}, {displayName}",
                    sortRank: 8
                },
                LotteryInAction: {
                    type: "string",
                    title: "抽選に参加",
                    description: "抽選に参加したとき（不要なら空欄）",
                    useTextArea: true,
                    default: "{displayName}さん、抽選にエントリーしました",
                    tip: "有効な変数: {username}, {displayName}",
                    sortRank: 9
                },
                LotterySuccessful: {
                    type: "string",
                    title: "抽選完了",
                    description: "抽選終了時（不要なら空欄）",
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
        lotteryCommand.registerLotteryCommand();
    },
    onUnload: () => {
        lotteryCommand.unregisterLotteryCommand();
        lotteryCommand.purgeCaches();
    },
    onSettingsUpdate: () => {
        lotteryCommand.purgeCaches();
    }
};

export = game;
