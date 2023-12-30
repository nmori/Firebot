"use strict";
const triviaCommand = require("./trivia-command");
/**
 * @type {import('../../game-manager').FirebotGame}
 */
module.exports = {
    id: "firebot-trivia",
    name: "トリビア",
    subtitle: "知識は力なり",
    description: "ユーザーは通貨を賭けてランダムなトリビアの問に答えることができる。トリビアの問題は https://opentdb.com/から取得しています",
    icon: "fa-head-side-brain",
    settingCategories: {
        currencySettings: {
            title: "通貨設定",
            sortRank: 1,
            settings: {
                currencyId: {
                    type: "currency-select",
                    title: "通貨",
                    description: "入札に使用する通貨",
                    sortRank: 1,
                    validation: {
                        required: true
                    }
                },
                defaultWager: {
                    type: "number",
                    title: "デフォルトの賭け金額",
                    description: "視聴者が賭け金を指定していない場合に使用する賭け金の初期値。",
                    placeholder: "金額を入れる",
                    tip: "任意",
                    sortRank: 2,
                    validation: {
                        min: 1
                    }
                },
                minWager: {
                    type: "number",
                    title: "最低賭け金額",
                    placeholder: "金額を入れる",
                    default: 1,
                    sortRank: 3,
                    validation: {
                        min: 1
                    }
                },
                maxWager: {
                    type: "number",
                    title: "最大賭け金額",
                    placeholder: "金額を入れる",
                    tip: "任意",
                    sortRank: 4,
                    validation: {
                        min: 1
                    }
                }
            }
        },
        questionSettings: {
            title: "質問設定",
            sortRank: 2,
            settings: {
                enabledCategories: {
                    type: "multiselect",
                    title: "有効なカテゴリ",
                    description: "有効な質問カテゴリ",
                    default: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29, 30, 31, 32],
                    settings: {
                        options: [
                            {
                                "id": 9,
                                "name": "一般常識"
                            },
                            {
                                "id": 10,
                                "name": "エンタメ：書籍"
                            },
                            {
                                "id": 11,
                                "name": "エンタメ：映画"
                            },
                            {
                                "id": 12,
                                "name": "エンタメ：音楽"
                            },
                            {
                                "id": 13,
                                "name": "エンタメ：ミュージカル＆劇場"
                            },
                            {
                                "id": 14,
                                "name": "エンタメ：テレビ"
                            },
                            {
                                "id": 15,
                                "name": "エンタメ：ゲーム"
                            },
                            {
                                "id": 16,
                                "name": "エンタメ：ボードゲーム"
                            },
                            {
                                "id": 17,
                                "name": "科学と自然"
                            },
                            {
                                "id": 18,
                                "name": "科学：コンピューター"
                            },
                            {
                                "id": 19,
                                "name": "科学：数学"
                            },
                            {
                                "id": 20,
                                "name": "神話"
                            },
                            {
                                "id": 21,
                                "name": "スポーツ"
                            },
                            {
                                "id": 22,
                                "name": "地理"
                            },
                            {
                                "id": 23,
                                "name": "歴史"
                            },
                            {
                                "id": 24,
                                "name": "政治"
                            },
                            {
                                "id": 25,
                                "name": "アート"
                            },
                            {
                                "id": 26,
                                "name": "セレブリティ"
                            },
                            {
                                "id": 27,
                                "name": "動物"
                            },
                            {
                                "id": 28,
                                "name": "車両"
                            },
                            {
                                "id": 29,
                                "name": "エンタメ：コミック"
                            },
                            {
                                "id": 30,
                                "name": "サイエンス：ガジェット"
                            },
                            {
                                "id": 31,
                                "name": "エンタメ：日本のアニメとマンガ"
                            },
                            {
                                "id": 32,
                                "name": "エンタメ：漫画・アニメ"
                            }
                        ]
                    },
                    sortRank: 1,
                    validation: {
                        required: true
                    }
                },
                enabledDifficulties: {
                    type: "multiselect",
                    title: "可能な困難",
                    default: ["easy", "medium", "hard"],
                    settings: {
                        options: [
                            {
                                id: "easy",
                                name: "かんたん"
                            },
                            {
                                id: "medium",
                                name: "普通"
                            },
                            {
                                id: "hard",
                                name: "難しい"
                            }
                        ]
                    },
                    sortRank: 2,
                    validation: {
                        required: true
                    }
                },
                enabledTypes: {
                    type: "multiselect",
                    title: "回答形式",
                    default: ["multiple", "boolean"],
                    settings: {
                        options: [
                            {
                                id: "boolean",
                                name: "はい・いいえ"
                            },
                            {
                                id: "multiple",
                                name: "複数選択"
                            }
                        ]
                    },
                    sortRank: 3,
                    validation: {
                        required: true
                    }
                },
                answerTime: {
                    type: "number",
                    title: "回答秒数（秒）",
                    description: "視聴者が質問に答えるのに要する時間（秒）。",
                    placeholder: "秒数を入力",
                    default: 30,
                    sortRank: 4,
                    validation: {
                        required: true,
                        min: 10
                    }
                }
            }
        },
        multiplierSettings: {
            title: "勝利倍率",
            sortRank: 3,
            settings: {
                easyMultipliers: {
                    title: "複数選択（かんたん）",
                    type: "role-numbers",
                    description: "ユーザーの役割ごとの当選倍率",
                    tip: "賞金は以下のように計算されます：賭け金額 * 乗数",
                    sortRank: 1,
                    settings: {
                        defaultBase: 1.50,
                        defaultOther: 1.60,
                        min: 1,
                        max: null
                    }
                },
                mediumMultipliers: {
                    title: "複数選択（普通）",
                    type: "role-numbers",
                    description: "視聴者の役割ごとの当選倍率",
                    tip: "賞金は以下のように計算されます：賭け金額 * 乗数",
                    sortRank: 2,
                    settings: {
                        defaultBase: 2.00,
                        defaultOther: 2.25,
                        min: 1,
                        max: null
                    }
                },
                hardMultipliers: {
                    title: "複数選択（難しい）",
                    type: "role-numbers",
                    description: "視聴者の役割ごとの当選倍率",
                    tip: "賞金は以下のように計算されます：賭け金額 * 乗数",
                    sortRank: 3,
                    settings: {
                        defaultBase: 3,
                        defaultOther: 3.50,
                        min: 1,
                        max: null
                    }
                }
            }
        },
        cooldownSettings: {
            title: "開催間隔",
            sortRank: 4,
            settings: {
                cooldown: {
                    type: "number",
                    title: "間隔 (秒)",
                    placeholder: "秒数を入れる",
                    description: "間隔は視聴者ごとに適用されます",
                    tip: "任意",
                    default: 300,
                    validation: {
                        min: 0
                    }
                }
            }
        },
        chatSettings: {
            title: "書き込み先",
            sortRank: 5,
            settings: {
                chatter: {
                    type: "chatter-select",
                    title: "アカウント",
                    sortRank: 1
                },
                noWagerMessage: {
                    type: "string",
                    title: "賭け金なしのメッセージ",
                    useTextArea: true,
                    default: "入力に誤りがあります。使用例） !trivia [wager]",
                    tip: "利用可能な変数: {user}",
                    sortRank: 2,
                    validation: {
                        required: true
                    }
                }
            }
        }
    },
    onLoad: () => {
        triviaCommand.registerTriviaCommand();
    },
    onUnload: () => {
        triviaCommand.unregisterTriviaCommand();
        triviaCommand.purgeCaches();
    },
    onSettingsUpdate: () => {
        triviaCommand.purgeCaches();
    }
};