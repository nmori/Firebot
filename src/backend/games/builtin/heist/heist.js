"use strict";

const heistCommand = require("./heist-command");

/**
 * @type {import('../../game-manager').FirebotGame}
 */
module.exports = {
    id: "firebot-heist",
    name: "Heist",
    subtitle: "Score big as a team",
    description: "This game allows viewers to wager their currency by participating in a heist. If they succeed, they will get a payout based on their initial wager. Feel free to edit all of the messages to completely change the theme!",
    icon: "fa-sack-dollar",
    settingCategories: {
        currencySettings: {
            title: "Currency Settings",
            sortRank: 1,
            settings: {
                currencyId: {
                    type: "currency-select",
                    title: "Currency",
                    description: "Which currency to use for this game.",
                    sortRank: 1,
                    validation: {
                        required: true
                    }
                },
                defaultWager: {
                    type: "number",
                    title: "Default Wager Amount",
                    description: "The default wager amount to use if a viewer doesn't specify one.",
                    placeholder: "Enter amount",
                    tip: "Optional",
                    sortRank: 2,
                    validation: {
                        min: 1
                    }
                },
                minWager: {
                    type: "number",
                    title: "Min Wager Amount",
                    placeholder: "Enter amount",
                    default: 1,
                    sortRank: 3,
                    validation: {
                        min: 1
                    }
                },
                maxWager: {
                    type: "number",
                    title: "Max Wager Amount",
                    placeholder: "Enter amount",
                    tip: "Optional",
                    sortRank: 4,
                    validation: {
                        min: 1
                    }
                }
            }
        },
        successChanceSettings: {
            title: "Success Chances",
            sortRank: 3,
            settings: {
                successChances: {
                    type: "role-percentages",
                    description: "The chances the viewer has of being surviving a heist",
                    tip: "The success chance for the first user role a viewer has in this list is used, so ordering is important!"
                }
            }
        },
        winningsMultiplierSettings: {
            title: "Winnings Multiplier",
            sortRank: 4,
            settings: {
                multipliers: {
                    type: "role-numbers",
                    description: "The winnings multiplier per user role",
                    tip: "The winnings are calculated as: WagerAmount * Multiplier",
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
            title: "General Settings",
            sortRank: 2,
            settings: {
                minimumUsers: {
                    type: "number",
                    title: "Minimum Users",
                    description: "The minimum required users before starting.",
                    placeholder: "Enter count",
                    default: 1,
                    sortRank: 1,
                    validation: {
                        min: 1
                    }
                },
                startDelay: {
                    type: "number",
                    title: "Start Delay (mins)",
                    description: "The delay time before a heist starts to allow people to join.",
                    placeholder: "Enter mins",
                    default: 2,
                    sortRank: 2,
                    validation: {
                        min: 1
                    }
                },
                cooldown: {
                    type: "number",
                    title: "Cooldown (mins)",
                    description: "The cooldown before another heist can be triggered.",
                    placeholder: "Enter mins",
                    default: 5,
                    sortRank: 3,
                    validation: {
                        min: 1
                    }
                }
            }
        },
        entryMessages: {
            title: "Entry Messages",
            sortRank: 6,
            settings: {
                onJoin: {
                    type: "string",
                    title: "On Join",
                    description: "Sent when a user joins the heist (leave empty for no message).",
                    useTextArea: true,
                    default: "{user} has joined the heist with {wager} {currency}!",
                    tip: "変数: {user}, {wager}, {currency}",
                    sortRank: 1
                },
                alreadyJoined: {
                    type: "string",
                    title: "Already Joined",
                    description: "Sent when a user has already joined the heist (leave empty for no message).",
                    useTextArea: true,
                    default: "{user}, you've already joined the heist team!",
                    tip: "変数: {user}",
                    sortRank: 2
                },
                noWagerAmount: {
                    type: "string",
                    title: "No Wager Amount",
                    description: "Sent when a user leaves out the wager amount (leave empty for no message).",
                    useTextArea: true,
                    default: "{user}, please include a wager amount!",
                    tip: "変数: {user}",
                    sortRank: 3
                },
                invalidWagerAmount: {
                    type: "string",
                    title: "Invalid Wager Amount",
                    description: "Sent when a user uses an invalid wager amount (leave empty for no message).",
                    useTextArea: true,
                    default: "{user}, please include a valid wager amount!",
                    tip: "変数: {user}",
                    sortRank: 4
                },
                wagerAmountTooLow: {
                    type: "string",
                    title: "Wager Amount Too Low",
                    description: "Sent when a user uses a wager amount below the minimum (leave empty for no message).",
                    useTextArea: true,
                    default: "{user}, the wager amount must be at least {minWager}!",
                    tip: "変数: {user}, {minWager}",
                    sortRank: 5
                },
                wagerAmountTooHigh: {
                    type: "string",
                    title: "Wager Amount Too High",
                    description: "Sent when a user uses a wager amount above the maximum (leave empty for no message).",
                    useTextArea: true,
                    default: "{user}, the wager amount can be no more than {maxWager}!",
                    tip: "変数: {user}, {maxWager}",
                    sortRank: 6
                },
                notEnoughToWager: {
                    type: "string",
                    title: "Not Enough To Wager",
                    description: "Sent when a user tries to wager more than they have (leave empty for no message).",
                    useTextArea: true,
                    default: "{user}, you don't have enough to wager this amount!",
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
                    description: "強盗が誰かによって開始されたときに送信される（メッセージなしの場合は空白にする）.",
                    useTextArea: true,
                    default: "@{user} is looking to put a team together for a heist! To join the team, type {command} [amount]",
                    tip: "変数: {user}, {command}, {maxWager}, {minWager}, {minimumUsers}"
                },
                onCooldown: {
                    type: "string",
                    title: "クールダウン時",
                    description: "誰かが強盗を引き起こそうとして、それがクールダウンしているときに送信されます（メッセージなしの場合は空白にしてください）",
                    useTextArea: true,
                    default: "この地域はまだ暑すぎる！しばらく待った方がいい。クールダウン： {cooldown}",
                    tip: "変数: {cooldown}"
                },
                cooldownOver: {
                    type: "string",
                    title: "クールダウン終了",
                    description: "クールダウンが終わると送信される（メッセージなしの場合は空白のまま）。",
                    useTextArea: true,
                    default: "海岸はクリア！別の強盗のためにチームを編成する時が来た。 {command} [amount]",
                    tip: "変数: {command}"
                },
                startMessage: {
                    type: "string",
                    title: "強盗開始",
                    description: "強盗が開始されたときに送信されます。.",
                    useTextArea: true,
                    default: "時間だ！全員が武器と装備をチェックし、逃走用の車から飛び降りて銀行に駆け込む。"
                },
                teamTooSmall: {
                    type: "string",
                    title: "小さすぎるチーム",
                    description: "開始ディレイが終了し、チームサイズが必要ユーザー数に達していない場合に送信されます。",
                    useTextArea: true,
                    default: "残念ながら、@{user}はチームの結成が間に合わず、強盗は中止となりました。",
                    tip: "変数: {user}"
                },
                heistWinnings: {
                    type: "string",
                    title: "ハイスト賞金",
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
            title: "Solo Outcome Messages",
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