import { FirebotGame } from "../../../../types/games";
import triviaCommand from "./trivia-command";

const game: FirebotGame = {
    id: "firebot-trivia",
    name: "トリビア",
    subtitle: "知識は力",
    description: "視聴者が通貨を賭けてランダムなトリビア問題に回答するゲームです。問題は https://opentdb.com/ から取得されます。",
    icon: "fa-head-side-brain",
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
        questionSettings: {
            title: "問題設定",
            sortRank: 2,
            settings: {
                enabledCategories: {
                    type: "multiselect",
                    title: "有効なカテゴリ",
                    description: "有効にする問題カテゴリ",
                    default: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29, 30, 31, 32],
                    settings: {
                        options: [
                            {
                                "id": 9,
                                "name": "General Knowledge"
                            },
                            {
                                "id": 10,
                                "name": "Entertainment: Books"
                            },
                            {
                                "id": 11,
                                "name": "Entertainment: Film"
                            },
                            {
                                "id": 12,
                                "name": "Entertainment: Music"
                            },
                            {
                                "id": 13,
                                "name": "Entertainment: Musicals & Theatres"
                            },
                            {
                                "id": 14,
                                "name": "Entertainment: Television"
                            },
                            {
                                "id": 15,
                                "name": "Entertainment: Video Games"
                            },
                            {
                                "id": 16,
                                "name": "Entertainment: Board Games"
                            },
                            {
                                "id": 17,
                                "name": "Science & Nature"
                            },
                            {
                                "id": 18,
                                "name": "Science: Computers"
                            },
                            {
                                "id": 19,
                                "name": "Science: Mathematics"
                            },
                            {
                                "id": 20,
                                "name": "Mythology"
                            },
                            {
                                "id": 21,
                                "name": "Sports"
                            },
                            {
                                "id": 22,
                                "name": "Geography"
                            },
                            {
                                "id": 23,
                                "name": "History"
                            },
                            {
                                "id": 24,
                                "name": "Politics"
                            },
                            {
                                "id": 25,
                                "name": "Art"
                            },
                            {
                                "id": 26,
                                "name": "Celebrities"
                            },
                            {
                                "id": 27,
                                "name": "Animals"
                            },
                            {
                                "id": 28,
                                "name": "Vehicles"
                            },
                            {
                                "id": 29,
                                "name": "Entertainment: Comics"
                            },
                            {
                                "id": 30,
                                "name": "Science: Gadgets"
                            },
                            {
                                "id": 31,
                                "name": "Entertainment: Japanese Anime & Manga"
                            },
                            {
                                "id": 32,
                                "name": "Entertainment: Cartoon & Animations"
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
                    title: "有効な難易度",
                    default: ["easy", "medium", "hard"],
                    settings: {
                        options: [
                            {
                                id: "easy",
                                name: "Easy"
                            },
                            {
                                id: "medium",
                                name: "Medium"
                            },
                            {
                                id: "hard",
                                name: "Hard"
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
                    title: "有効な問題形式",
                    default: ["multiple", "boolean"],
                    settings: {
                        options: [
                            {
                                id: "boolean",
                                name: "True/False"
                            },
                            {
                                id: "multiple",
                                name: "Multiple Choice"
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
                    title: "回答時間（秒）",
                    description: "視聴者が問題に回答するための時間（秒）。",
                    placeholder: "秒を入力",
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
            title: "獲得倍率",
            sortRank: 3,
            settings: {
                easyMultipliers: {
                    title: "簡単 倍率",
                    type: "role-numbers",
                    description: "簡単な問題のユーザーロールごとの獲得倍率",
                    tip: "報酬は 賭け金 × 倍率 で計算されます",
                    sortRank: 1,
                    settings: {
                        defaultBase: 1.50,
                        defaultOther: 1.60,
                        min: 1,
                        max: null
                    }
                },
                mediumMultipliers: {
                    title: "普通 倍率",
                    type: "role-numbers",
                    description: "普通の問題のユーザーロールごとの獲得倍率",
                    tip: "報酬は 賭け金 × 倍率 で計算されます",
                    sortRank: 2,
                    settings: {
                        defaultBase: 2.00,
                        defaultOther: 2.25,
                        min: 1,
                        max: null
                    }
                },
                hardMultipliers: {
                    title: "難しい 倍率",
                    type: "role-numbers",
                    description: "難しい問題のユーザーロールごとの獲得倍率",
                    tip: "報酬は 賭け金 × 倍率 で計算されます",
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
            title: "クールダウン",
            sortRank: 4,
            settings: {
                cooldown: {
                    type: "number",
                    title: "クールダウン（秒）",
                    placeholder: "秒を入力",
                    description: "視聴者ごとにクールダウンが適用されます。",
                    tip: "任意",
                    default: 300,
                    validation: {
                        min: 0
                    }
                }
            }
        },
        chatSettings: {
            title: "チャット設定",
            sortRank: 5,
            settings: {
                chatter: {
                    type: "chatter-select",
                    title: "発言者",
                    sortRank: 1
                },
                noWagerMessage: {
                    type: "string",
                    title: "賭け金未入力メッセージ",
                    useTextArea: true,
                    default: "トリビアの使い方が正しくありません: !trivia [賭け金]",
                    tip: "Available variables: {user}",
                    sortRank: 2,
                    validation: {
                        required: true
                    }
                },
                postCorrectAnswer: {
                    type: "boolean",
                    title: "正解を投稿する",
                    tip: "視聴者が間違えた場合、チャットに正解を投稿します。",
                    default: false,
                    sortRank: 3,
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

export = game;