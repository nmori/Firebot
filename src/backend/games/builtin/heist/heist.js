"use strict";

const heistCommand = require("./heist-command");

/**
 * @type {import('../../game-manager').FirebotGame}
 */
module.exports = {
    id: "firebot-heist",
    name: "強盗",
    subtitle: "チームとして大きな得点",
    description: "このゲームでは、視聴者は強盗に参加して通貨を賭けることができる。成功すれば、最初の賭け金に応じた配当が得られます。すべてのメッセージを編集して、テーマを自由に作り替えてください",
    icon: "fa-sack-dollar",
    settingCategories: {
        currencySettings: {
            title: "通貨設定",
            sortRank: 1,
            settings: {
                currencyId: {
                    type: "currency-select",
                    title: "通貨",
                    description: "ゲームで使う通貨の選択",
                    sortRank: 1,
                    validation: {
                        required: true
                    }
                },
                defaultWager: {
                    type: "number",
                    title: "掛け金の初期値",
                    description: "視聴者が賭け金を指定しなかった場合に使用するデフォルトの賭け金額。",
                    placeholder: "金額を入れる",
                    tip: "任意",
                    sortRank: 2,
                    validation: {
                        min: 1
                    }
                },
                minWager: {
                    type: "number",
                    title: "掛け金の最小値",
                    placeholder: "金額を入れる",
                    default: 1,
                    sortRank: 3,
                    validation: {
                        min: 1
                    }
                },
                maxWager: {
                    type: "number",
                    title: "掛け金の最大値",
                    placeholder: "金額を入れる",
                    tip: "任意",
                    sortRank: 4,
                    validation: {
                        min: 1
                    }
                }
            }
        },
        successChanceSettings: {
            title: "成功の可能性",
            sortRank: 3,
            settings: {
                successChances: {
                    type: "role-percentages",
                    description: "視聴者が強盗から生き延びる可能性",
                    tip: "このリストでは、視聴者の役割の最初に一致する項目が成功確率として使用されるため、順番は重要である！"
                }
            }
        },
        winningsMultiplierSettings: {
            title: "勝利倍率",
            sortRank: 4,
            settings: {
                multipliers: {
                    type: "role-numbers",
                    description: "視聴者の役割ごとの当選倍率",
                    tip: "賞金は以下のように計算されます： 賭け金額 * 乗数",
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
                    title: "最小参加人数",
                    description: "開始前に最低限必要な視聴者数",
                    placeholder: "数値を入れる",
                    default: 1,
                    sortRank: 1,
                    validation: {
                        min: 1
                    }
                },
                startDelay: {
                    type: "number",
                    title: "開始までの時間(分)",
                    description: "強盗が始まるまでの遅延時間",
                    placeholder: "時間を入れる",
                    default: 2,
                    sortRank: 2,
                    validation: {
                        min: 1
                    }
                },
                cooldown: {
                    type: "number",
                    title: "最低開催間隔(分)",
                    description: "別の強盗が発動するまでの待ち時間。",
                    placeholder: "時間を入れる",
                    default: 5,
                    sortRank: 3,
                    validation: {
                        min: 1
                    }
                }
            }
        },
        entryMessages: {
            title: "メッセージを入れる",
            sortRank: 6,
            settings: {
                onJoin: {
                    type: "string",
                    title: "参加時",
                    description: "ユーザーがゲームに参加したときに送信されます（メッセージなしの場合は空白のまま）",
                    useTextArea: true,
                    default: "{user}さんが{wager}{currency}で強盗に加わりました！",
                    tip: "変数: {user}, {wager}, {currency}",
                    sortRank: 1
                },
                alreadyJoined: {
                    type: "string",
                    title: "参加済み",
                    description: "ユーザーが強盗に参加済みの場合に送信されます（メッセージなしの場合は空白のまま）",
                    useTextArea: true,
                    default: "{user}さん,あなたはすでに強盗チームに加わっているよ",
                    tip: "変数: {user}",
                    sortRank: 2
                },
                noWagerAmount: {
                    type: "string",
                    title: "賭け金なし",
                    description: "ユーザーが賭け金額を入力しなかった場合に送信されます。",
                    useTextArea: true,
                    default: "{user}さん, 掛け金を入れてね",
                    tip: "変数: {user}",
                    sortRank: 3
                },
                invalidWagerAmount: {
                    type: "string",
                    title: "無効な掛け金",
                    description: "ユーザーが無効な賭け金を使用した場合に送信されます。",
                    useTextArea: true,
                    default: "{user}さん, 有効な賭け金額をいれてください",
                    tip: "変数: {user}",
                    sortRank: 4
                },
                wagerAmountTooLow: {
                    type: "string",
                    title: "賭け金額が低すぎるとき",
                    description: "ユーザーが最低額を下回る賭け金を使用した場合に送信されます（メッセージなしの場合は空白のまま）",
                    useTextArea: true,
                    default: "{user}さん, 賭け金額は{minWager}以上にしてください",
                    tip: "変数: {user}, {minWager}",
                    sortRank: 5
                },
                wagerAmountTooHigh: {
                    type: "string",
                    title: "賭け金額が高すぎるとき",
                    description: "ユーザーが最大額を超える賭け金を使用した場合に送信されます（メッセージなしの場合は空白のまま）",
                    useTextArea: true,
                    default: "{user}さん, 賭け金額は {maxWager}以下にしてください",
                    tip: "変数: {user}, {maxWager}",
                    sortRank: 6
                },
                notEnoughToWager: {
                    type: "string",
                    title: "所持金がたりないとき",
                    description: "ユーザーが所持金以上の金額を賭けようとしたときに送信されます（メッセージなしの場合は空白のまま）",
                    useTextArea: true,
                    default: "{user}さん, この金額を賭けるだけの手持ちがないよ",
                    tip: "変数: {user}",
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
                    description: "強盗が誰かによって開始されたときに送信される（メッセージなしの場合は空白のまま）.",
                    useTextArea: true,
                    default: "{user}が強盗のためにチームを結成しようとしている！チームに参加するには {command} [掛け金] を入力してください。",
                    tip: "変数: {user}, {command}, {maxWager}, {minWager}, {minimumUsers}"
                },
                onCooldown: {
                    type: "string",
                    title: "開催待ち時間の時",
                    description: "誰かが強盗を引き起こそうとして、それが開催まちのときに送信されます（メッセージなしの場合は空白のまま）",
                    useTextArea: true,
                    default: "強盗は次の時間経過後に開催できます： {cooldown}",
                    tip: "変数: {cooldown}"
                },
                cooldownOver: {
                    type: "string",
                    title: "待ち時間終了",
                    description: "開催待ち時間が終わると送信される（メッセージなしの場合は空白のまま）。",
                    useTextArea: true,
                    default: "海岸はクリア！別の強盗のためにチームを編成する時が来た。 {command} [amount]",
                    tip: "変数: {command}"
                },
                startMessage: {
                    type: "string",
                    title: "強盗開始",
                    description: "強盗が開始されたときに送信されます。.",
                    useTextArea: true,
                    default: "時間だ！全員が武器と装備をチェックし、逃走用の車から飛び降りて銀行に駆け込むぞ"
                },
                teamTooSmall: {
                    type: "string",
                    title: "小さすぎるチーム",
                    description: "開始まちが終了し、チームが必要人数に達していない場合に送信されます。",
                    useTextArea: true,
                    default: "残念ながら、@{user}はチームの結成が間に合わず、強盗は中止となりました。",
                    tip: "変数: {user}"
                },
                heistWinnings: {
                    type: "string",
                    title: "強盗賞金",
                    description: "強盗の完了時に送信され、生存者と賞金のリストが表示される。",
                    useTextArea: true,
                    default: "勝利: {winnings}",
                    tip: "変数: {winnings}"
                }
            }
        },
        groupOutcomeMessages: {
            title: "グループ成果メッセージ",
            sortRank: 7,
            settings: {
                hundredPercent: {
                    type: "editable-list",
                    title: "100% 勝利",
                    default: [
                        "強盗は完全に成功し、全員が逃走用の車で脱出した！"
                    ],
                    description: "この中からランダムに1つ選ばれる。",
                    sortRank: 5,
                    settings: {
                        useTextArea: true,
                        sortable: false,
                        addLabel: "新規",
                        editLabel: "編集",
                        noneAddedText: "未保存"
                    }
                },
                top25Percent: {
                    type: "editable-list",
                    title: "75-99% 勝利",
                    default: [
                        "銀行を出るときに何人かが倒れたが、チームのほとんどは無事だった！"
                    ],
                    description: "One of these will be chosen at random.",
                    sortRank: 4,
                    settings: {
                        useTextArea: true,
                        sortable: false,
                        addLabel: "新規",
                        editLabel: "編集",
                        noneAddedText: "未保存"
                    }
                },
                mid50Percent: {
                    type: "editable-list",
                    title: "25-74% 勝利",
                    default: [
                        "警備は予想以上に厳しく、銃撃戦に巻き込まれた者も多かったが、現金を持って脱出した者もいた。"
                    ],
                    description: "この中からランダムに1つ選ばれる。",
                    sortRank: 3,
                    settings: {
                        useTextArea: true,
                        sortable: false,
                        addLabel: "新規",
                        editLabel: "編集",
                        noneAddedText: "未保存"
                    }
                },
                bottom25Percent: {
                    type: "editable-list",
                    title: "1-24% 勝利",
                    default: [
                        "ほぼ全員が死亡し、幸運な数人が残された現金を持ってボートにたどり着いた......。"
                    ],
                    description: "この中からランダムに1つ選ばれる.",
                    sortRank: 2,
                    settings: {
                        useTextArea: true,
                        sortable: false,
                        addLabel: "新規",
                        editLabel: "編集",
                        noneAddedText: "未保存"
                    }
                },
                zeroPercent: {
                    type: "editable-list",
                    title: "0% 勝利",
                    default: [
                        "あなたの最善の努力にもかかわらず、チーム全体が失われてしまった...。"
                    ],
                    description: "この中からランダムに1つ選ばれる。",
                    sortRank: 1,
                    settings: {
                        useTextArea: true,
                        sortable: false,
                        addLabel: "新規",
                        editLabel: "編集",
                        noneAddedText: "未保存"
                    }
                }
            }
        },
        soloOutcomeMessages: {
            title: "単独メッセージ",
            sortRank: 8,
            settings: {
                soloSuccess: {
                    type: "editable-list",
                    title: "単独で成功",
                    description: "ソロチームでの強盗成功時に送られる（ランダムで1通選ばれる）",
                    default: [
                        "@{user} は自分たちだけで強盗をやり遂げ、大金を手にした！"
                    ],
                    tip: "変数: {user}",
                    sortRank: 1,
                    settings: {
                        useTextArea: true,
                        sortable: false,
                        addLabel: "新規",
                        editLabel: "編集",
                        noneAddedText: "未保存"
                    }
                },
                soloFail: {
                    type: "editable-list",
                    title: "単独で失敗",
                    description: "ソロチームでの強盗失敗時に送信（ランダムで1通が選ばれる）",
                    default: [
                        "@{user} はうまくいかず、逮捕された！"
                    ],
                    tip: "変数: {user}",
                    sortRank: 2,
                    settings: {
                        useTextArea: true,
                        sortable: false,
                        addLabel: "新規",
                        editLabel: "編集",
                        noneAddedText: "未保存"
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
                    title: "チャットの内容"
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