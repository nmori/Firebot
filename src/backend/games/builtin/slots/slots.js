"use strict";

const spinCommand = require("./spin-command");

/**
 * @type {import('../../game-manager').FirebotGame}
 */
module.exports = {
    id: "firebot-slots",
    name: "スロット",
    subtitle: "回して勝つ",
    description: "このゲームでは、視聴者がスロットマシンで通貨を賭けることができます。必要なのは、チャットで「!spin [wagerAmount]」と入力してレバーを引くだけである！レバーを引くと、3つのリールが回転し、それぞれHITまたはMISSします。HITした数が賞金を決定します！",
    icon: "fa-dice-three",
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
                    title: "デフォルトの賭け金額",
                    description: "視聴者が賭け金を指定していない場合に使用するデフォルトの賭け金。",
                    placeholder: "金額を入れる",
                    tip: "任意",
                    sortRank: 2,
                    validation: {
                        min: 0
                    }
                },
                minWager: {
                    type: "number",
                    title: "最低金額",
                    placeholder: "金額を入れる",
                    tip: "任意",
                    sortRank: 3,
                    validation: {
                        min: 0
                    }
                },
                maxWager: {
                    type: "number",
                    title: "最高金額",
                    placeholder: "金額を入れる",
                    tip: "任意",
                    sortRank: 4,
                    validation: {
                        min: 0
                    }
                }
            }
        },
        spinSettings: {
            title: "回転設定",
            sortRank: 2,
            settings: {
                successChances: {
                    type: "role-percentages",
                    title: "グループ別の成功確率",
                    description: "グループによって成功する確率を変えられます（1回のスピンには3つのグループがあります。）",
                    tip: "このリストでは、視聴者が最初に持つユーザーグループの成功確率が使用されるため、順番は重要です",
                    sortRank: 1
                },
                multiplier: {
                    type: "number",
                    title: "勝利倍率",
                    description: "各ロール成功時の賞金倍率",
                    tip: "賞金は以下のように計算されます： 賭け金額 * (成功数 * 倍率)",
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
                alreadySpinning: {
                    type: "string",
                    title: "すでに回転中",
                    description: "回転開始の指示が速すぎる場合（メッセージが不要な場合は空白にします）",
                    useTextArea: true,
                    default: "{displayName}さん,スロットマシンはすでに動いています",
                    tip: "有効な変数 variables: {username}, {displayName}",
                    sortRank: 1
                },
                onCooldown: {
                    type: "string",
                    title: "再実行までの待ち時間中",
                    description: "ユーザーが待ち時間を満了していない時（メッセージが不要な場合は空白にします）",
                    useTextArea: true,
                    default: "{displayName}さん, スロットマシンを回せるまでの残り時間: {timeRemaining}",
                    tip: "有効な変数: {username}, {displayName}, {timeRemaining}",
                    sortRank: 2
                },
                noWagerAmount: {
                    type: "string",
                    title: "賭け金なし",
                    description: "ユーザーが賭け金額を入力しなかった場合に送信されます。",
                    useTextArea: true,
                    default: "{displayName}さん, 賭け金の金額をご記入ください",
                    tip: "有効な変数: {user}, {displayName}",
                    sortRank: 3
                },
                invalidWagerAmount: {
                    type: "string",
                    title: "無効な賭け金",
                    description: "ユーザーが無効な賭け金を使用した場合に送信されます（メッセージが不要な場合は空白にします）",
                    useTextArea: true,
                    default: "{displayName}さん, 有効な賭け金額をご記入ください",
                    tip: "有効な変数: {user}, {displayName}",
                    sortRank: 4
                },
                moreThanZero: {
                    type: "string",
                    title: "0以上",
                    description: "ユーザーが0通貨でスピンをしようとした場合（メッセージが不要な場合は空白にします）",
                    useTextArea: true,
                    default: "{displayName}さん, 賭け金は0より上でなければなりません。",
                    tip: "有効な変数: {username}, {displayName}",
                    sortRank: 5
                },
                minWager: {
                    type: "string",
                    title: "金額が低すぎる",
                    description: "賭け金の額が低すぎる場合（メッセージが不要な場合は空白にします）",
                    useTextArea: true,
                    default: "{displayName}さん, 掛け金は {minWager} 以上としてください",
                    tip: "有効な変数: {username}, {displayName}, {minWager}",
                    sortRank: 6
                },
                maxWager: {
                    type: "string",
                    title: "金額が高すぎる",
                    description: "賭け金の額が高すぎる場合（メッセージが不要な場合は空白にします）",
                    useTextArea: true,
                    default: "{displayName}さん, 掛け金は {maxWager} 以下としてください",
                    tip: "有効な変数: {username}, {displayName}, {maxWager}",
                    sortRank: 7
                },
                notEnough: {
                    type: "string",
                    title: "不十分",
                    description: "選択した金額を賭けるだけの十分な資金がない場合（メッセージなしの場合は空欄のまま）。",
                    useTextArea: true,
                    default: "{displayName}さん, この金額を賭けるだけの資金がありません",
                    tip: "有効な変数: {username}, {displayName}",
                    sortRank: 8
                },
                spinInAction: {
                    type: "string",
                    title: "回転中",
                    description: "スピンが行われている時（メッセージなしの場合は空欄のまま）",
                    useTextArea: true,
                    default: "{displayName}さんがレバーを引きました...",
                    tip: "有効な変数: {username}",
                    sortRank: 9
                },
                spinSuccessful: {
                    type: "string",
                    title: "回転完了",
                    description: "スピンが終了した時（メッセージなしの場合は空欄のまま）",
                    useTextArea: true,
                    default: "{displayName} さんの結果...当たりは {successfulRolls} / 3 、{winningsAmount} {currencyName}を獲得！",
                    tip: "有効な変数: {username}, {displayName}, {successfulRolls}, {winningsAmount}, {currencyName}",
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