import type { FirebotGame } from "../../../../types/games";
import spinCommand from "./spin-command";

const game: FirebotGame = {
    id: "firebot-slots",
    name: "スロット",
    subtitle: "回して勝利を狙う",
    description: "視聴者が通貨を賭けてスロットを回すゲームです。!spin [賭け金] を入力してレバーを引き、3リールのHIT数に応じて配当が決まります。",
    icon: "fa-dice-three",
    settingCategories: {
        currencySettings: {
            title: "通貨設定",
            sortRank: 1,
            settings: {
                currencyId: {
                    type: "currency-select",
                    title: "通貨",
                    description: "このゲームで使用する通貨。",
                    sortRank: 1,
                    validation: {
                        required: true
                    }
                },
                defaultWager: {
                    type: "number",
                    title: "デフォルト賭け金額",
                    description: "視聴者が賭け金を指定しない場合のデフォルト値。",
                    placeholder: "金額を入力",
                    tip: "任意",
                    sortRank: 2,
                    validation: {
                        min: 0
                    }
                },
                minWager: {
                    type: "number",
                    title: "最小賭け金額",
                    placeholder: "金額を入力",
                    tip: "任意",
                    sortRank: 3,
                    validation: {
                        min: 0
                    }
                },
                maxWager: {
                    type: "number",
                    title: "最大賭け金額",
                    placeholder: "金額を入力",
                    tip: "任意",
                    sortRank: 4,
                    validation: {
                        min: 0
                    }
                }
            }
        },
        spinSettings: {
            title: "スピン設定",
            sortRank: 2,
            settings: {
                successChances: {
                    type: "role-percentages",
                    title: "ロール成功確率",
                    description: "各ロールが成功する確率（1スピンにつき3ロール）",
                    tip: "一番最初に該当するユーザーロールでの成功確率が使われるため、順序が重要です！",
                    sortRank: 1
                },
                multiplier: {
                    type: "number",
                    title: "獲得倍率",
                    description: "成功したロールごとの獲得倍率",
                    tip: "報酬は 賭け金 × (成功数 × 倍率) で計算されます",
                    sortRank: 2,
                    default: 1,
                    validation: {
                        required: true,
                        min: 0.5
                    }
                }
            }
        },
        cooldownSettings: {
            title: "クールダウン",
            sortRank: 3,
            settings: {
                cooldown: {
                    type: "number",
                    title: "クールダウン（秒）",
                    placeholder: "秒を入力",
                    tip: "クールダウンは視聴者ごとに適用されます。",
                    default: 300,
                    validation: {
                        required: true,
                        min: 0
                    }
                }
            }
        },
        generalMessages: {
            title: "一般メッセージ",
            sortRank: 5,
            settings: {
                alreadySpinning: {
                    type: "string",
                    title: "スピン中",
                    description: "スピンが完了する前に再度試みたとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "{username}、スロットは今動作中です！",
                    tip: "使用可能な変数: {username}",
                    sortRank: 1
                },
                onCooldown: {
                    type: "string",
                    title: "クールダウン中",
                    description: "コマンドがクールダウン中のとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "{username}、スロットはクールダウン中です。残り時間: {timeRemaining}",
                    tip: "使用可能な変数: {username}, {timeRemaining}",
                    sortRank: 2
                },
                noWagerAmount: {
                    type: "string",
                    title: "賭け金未入力",
                    description: "ユーザーが賭け金を入力しなかったとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "{user}、賭け金を入力してください！",
                    tip: "使用可能な変数: {user}",
                    sortRank: 3
                },
                invalidWagerAmount: {
                    type: "string",
                    title: "無効な賭け金",
                    description: "ユーザーが無効な賭け金を入力したとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "{user}、有効な賭け金を入力してください！",
                    tip: "使用可能な変数: {user}",
                    sortRank: 4
                },
                moreThanZero: {
                    type: "string",
                    title: "0より多く",
                    description: "ユーザーが0通貨でスピンを試みたとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "{username}、賭け金は0より多くしてください。",
                    tip: "使用可能な変数: {username}",
                    sortRank: 5
                },
                minWager: {
                    type: "string",
                    title: "金額が少なすぎる",
                    description: "賭け金が最小額を下回るとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "{username}、賭け金は {minWager} 以上にしてください。",
                    tip: "使用可能な変数: {username}, {minWager}",
                    sortRank: 6
                },
                maxWager: {
                    type: "string",
                    title: "金額が多すぎる",
                    description: "賭け金が最大額を超えるとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "{username}、賭け金は {maxWager} 以下にしてください。",
                    tip: "使用可能な変数: {username}, {maxWager}",
                    sortRank: 7
                },
                notEnough: {
                    type: "string",
                    title: "残高不足",
                    description: "ユーザーが賭け金分の残高を持っていないとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "{username}、賭け金が足りません！",
                    tip: "使用可能な変数: {username}",
                    sortRank: 8
                },
                spinInAction: {
                    type: "string",
                    title: "スピン中",
                    description: "スピンが実行中のとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "{username} がレバーを引く...",
                    tip: "使用可能な変数: {username}",
                    sortRank: 9
                },
                spinSuccessful: {
                    type: "string",
                    title: "スピン結果",
                    description: "スピンが完了したとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "{username} が3回中{successfulRolls}回HITし、{winningsAmount} {currencyName} を獲得！",
                    tip: "使用可能な変数: {username}, {successfulRolls}, {winningsAmount}, {currencyName}",
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
                    title: "発言者"
                }
            }
        }
    },
    onLoad: () => {
        spinCommand.registerSpinCommand();
    },
    onUnload: () => {
        spinCommand.unregisterSpinCommand();
        spinCommand.purgeCaches();
    },
    onSettingsUpdate: () => {
        spinCommand.purgeCaches();
    }
};

export = game;