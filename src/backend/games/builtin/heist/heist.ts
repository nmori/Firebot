import type { FirebotGame } from "../../../../types/games";
import * as heistCommand from "./heist-command";

const game: FirebotGame = {
    id: "firebot-heist",
    name: "強盗",
    subtitle: "チームで一攫千金を狙う",
    description: "視聴者が通貨を賭けて強盗に参加するゲームです。成功すると賭け金に応じた報酬を獲得できます。メッセージ文面は自由に変更できます。",
    icon: "fa-sack-dollar",
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
                        min: 1
                    }
                },
                minWager: {
                    type: "number",
                    title: "最小賭け金額",
                    placeholder: "金額を入力",
                    default: 1,
                    sortRank: 3,
                    validation: {
                        required: true,
                        min: 1
                    }
                },
                maxWager: {
                    type: "number",
                    title: "最大賭け金額",
                    placeholder: "金額を入力",
                    tip: "任意",
                    sortRank: 4,
                    validation: {
                        min: 1
                    }
                }
            }
        },
        successChanceSettings: {
            title: "成功確率",
            sortRank: 3,
            settings: {
                successChances: {
                    type: "role-percentages",
                    title: undefined,
                    description: "視聴者が強盗で生き残る確率",
                    tip: "一番最初に該当するユーザーロールでの成功確率が使われるため、順序が重要です！"
                }
            }
        },
        winningsMultiplierSettings: {
            title: "強盗報酬倍率",
            sortRank: 4,
            settings: {
                multipliers: {
                    type: "role-numbers",
                    title: undefined,
                    description: "ユーザーロールごとの報酬倍率",
                    tip: "報酬は 賭け金 × 倍率 で計算されます",
                    settings: {
                        defaultBase: 1.5,
                        defaultOther: 2,
                        min: 1,
                        max: null
                    }
                }
            }
        },
        generalSettings: {
            title: "一般設定",
            sortRank: 2,
            settings: {
                minimumUsers: {
                    type: "number",
                    title: "最少メンバー数",
                    description: "開始に必要な最小の参加人数。",
                    placeholder: "数を入力",
                    default: 1,
                    sortRank: 1,
                    validation: {
                        required: true,
                        min: 1
                    }
                },
                startDelay: {
                    type: "number",
                    title: "開始までの待機時間（分）",
                    description: "参加者を待つための待機時間。",
                    placeholder: "分を入力",
                    default: 2,
                    sortRank: 2,
                    validation: {
                        required: true,
                        min: 1
                    }
                },
                cooldown: {
                    type: "number",
                    title: "クールダウン（分）",
                    description: "次の強盗を開始できるまでのクールダウン。",
                    placeholder: "分を入力",
                    default: 5,
                    sortRank: 3,
                    validation: {
                        required: true,
                        min: 1
                    }
                }
            }
        },
        entryMessages: {
            title: "参加メッセージ",
            sortRank: 6,
            settings: {
                onJoin: {
                    type: "string",
                    title: "参加時",
                    description: "ユーザーが強盗に参加したとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "{user} が {wager} {currency} で強盗に参加しました！",
                    tip: "使用可能な変数: {user}, {wager}, {currency}",
                    sortRank: 1
                },
                alreadyJoined: {
                    type: "string",
                    title: "参加済み",
                    description: "ユーザーがすでに参加しているとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "{user}、すでにチームに参加しています！",
                    tip: "使用可能な変数: {user}",
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
                wagerAmountTooLow: {
                    type: "string",
                    title: "賭け金が小さすぎる",
                    description: "ユーザーが最小金額未満の賭け金を入力したとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "{user}、賭け金は {minWager} 以上入力してください！",
                    tip: "使用可能な変数: {user}, {minWager}",
                    sortRank: 5
                },
                wagerAmountTooHigh: {
                    type: "string",
                    title: "賭け金が大きすぎる",
                    description: "ユーザーが最大金額超過の賭け金を入力したとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "{user}、賭け金は {maxWager} 以下にしてください！",
                    tip: "使用可能な変数: {user}, {maxWager}",
                    sortRank: 6
                },
                notEnoughToWager: {
                    type: "string",
                    title: "賭け金が足りない",
                    description: "ユーザーが所持より多い賭け金の入力を試みたとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "{user}、賭け金が足りません！",
                    tip: "使用可能な変数: {user}",
                    sortRank: 7
                }
            }
        },
        generalMessages: {
            title: "一般メッセージ",
            sortRank: 5,
            settings: {
                teamCreation: {
                    type: "string",
                    title: "チーム結成",
                    description: "強盗が開始されたとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "@{user} が強盗チームを結成しようとしています！参加するには {command} [金額] と入力。",
                    tip: "使用可能な変数: {user}, {command}, {maxWager}, {minWager}, {minimumUsers}"
                },
                onCooldown: {
                    type: "string",
                    title: "クールダウン中",
                    description: "クールダウン中に強盗をトリガーしたとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "まだ状況が悪いです！少し待ちましょう。クールダウン: {cooldown}",
                    tip: "使用可能な変数: {cooldown}"
                },
                cooldownOver: {
                    type: "string",
                    title: "クールダウン終了",
                    description: "クールダウンが終わったとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "もう安全です！次の強盗を始めましょう。 {command} [金額] で参加！",
                    tip: "使用可能な変数: {command}"
                },
                startMessage: {
                    type: "string",
                    title: "強盗開始",
                    description: "強盗が始まったとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "いよいよだ！全員が武器と装備を確認し、逃走車から飛び出して銀行へ突進する。"
                },
                teamTooSmall: {
                    type: "string",
                    title: "チーム人数不足",
                    description: "待機時間が終わったがチーム人数が足りないとき（不要なら空欄）。",
                    useTextArea: true,
                    default: "残念ながら @{user} は時間内にチームをまとめられず、強盗はキャンセルされました。",
                    tip: "使用可能な変数: {user}"
                },
                heistWinnings: {
                    type: "string",
                    title: "強盗報酬",
                    description: "強盗の終了時に生き残ったメンバーと報酬を表示（不要なら空欄）。",
                    useTextArea: true,
                    default: "報酬: {winnings}",
                    tip: "使用可能な変数: {winnings}"
                }
            }
        },
        groupOutcomeMessages: {
            title: "グループ結果メッセージ",
            sortRank: 7,
            settings: {
                hundredPercent: {
                    type: "editable-list",
                    title: "100% 勝利",
                    default: [
                        "強盗は完全成功！全員が逃走車で逃げ切った！"
                    ],
                    description: "ランダムに選ばれます。",
                    sortRank: 5,
                    settings: {
                        useTextArea: true,
                        sortable: false,
                        addLabel: "メッセージを追加",
                        editLabel: "メッセージを編集",
                        noneAddedText: "未登録"
                    }
                },
                top25Percent: {
                    type: "editable-list",
                    title: "75-99% 勝利",
                    default: [
                        "数名が銀行出口で倒れたが、多くのメンバーが逃げ切った！"
                    ],
                    description: "ランダムに選ばれます。",
                    sortRank: 4,
                    settings: {
                        useTextArea: true,
                        sortable: false,
                        addLabel: "メッセージを追加",
                        editLabel: "メッセージを編集",
                        noneAddedText: "未登録"
                    }
                },
                mid50Percent: {
                    type: "editable-list",
                    title: "25-74% 勝利",
                    default: [
                        "警備が予想以上に固く多くのメンバーが倒れたが、一部は現金を持って逃げ切った。"
                    ],
                    description: "ランダムに選ばれます。",
                    sortRank: 3,
                    settings: {
                        useTextArea: true,
                        sortable: false,
                        addLabel: "メッセージを追加",
                        editLabel: "メッセージを編集",
                        noneAddedText: "未登録"
                    }
                },
                bottom25Percent: {
                    type: "editable-list",
                    title: "1-24% 勝利",
                    default: [
                        "ほぼ全滅だった。数人が残った現金を持って逃げた..."
                    ],
                    description: "ランダムに選ばれます。",
                    sortRank: 2,
                    settings: {
                        useTextArea: true,
                        sortable: false,
                        addLabel: "メッセージを追加",
                        editLabel: "メッセージを編集",
                        noneAddedText: "未登録"
                    }
                },
                zeroPercent: {
                    type: "editable-list",
                    title: "0% 勝利",
                    default: [
                        "全力を尽くしたが、チーム全員が失われた..."
                    ],
                    description: "ランダムに選ばれます。",
                    sortRank: 1,
                    settings: {
                        useTextArea: true,
                        sortable: false,
                        addLabel: "メッセージを追加",
                        editLabel: "メッセージを編集",
                        noneAddedText: "未登録"
                    }
                }
            }
        },
        soloOutcomeMessages: {
            title: "ソロ結果メッセージ",
            sortRank: 8,
            settings: {
                soloSuccess: {
                    type: "editable-list",
                    title: "ソロ成功",
                    description: "ソロで強盗が成功したとき（ランダムに選ばれます）",
                    default: [
                        "@{user} は一人で強盗を成就、大金を手に入れた！"
                    ],
                    tip: "使用可能な変数: {user}",
                    sortRank: 1,
                    settings: {
                        useTextArea: true,
                        sortable: false,
                        addLabel: "メッセージを追加",
                        editLabel: "メッセージを編集",
                        noneAddedText: "未登録"
                    }
                },
                soloFail: {
                    type: "editable-list",
                    title: "ソロ失敗",
                    description: "ソロで強盗が失敗したとき（ランダムに選ばれます）",
                    default: [
                        "@{user} はすべてが裏目に出て、逆捕されてしまった！"
                    ],
                    tip: "使用可能な変数: {user}",
                    sortRank: 2,
                    settings: {
                        useTextArea: true,
                        sortable: false,
                        addLabel: "メッセージを追加",
                        editLabel: "メッセージを編集",
                        noneAddedText: "未登録"
                    }
                }
            }
        },
        chatSettings: {
            title: "チャット設定",
            sortRank: 9,
            settings: {
                chatter: {
                    type: "chatter-select",
                    title: "発言者"
                }
            }
        }
    },
    onLoad: () => {
        heistCommand.registerHeistCommand();
    },
    onUnload: () => {
        heistCommand.unregisterHeistCommand();
        heistCommand.clearCooldown();
    },
    onSettingsUpdate: () => {
        heistCommand.clearCooldown();
    }
};

export = game;