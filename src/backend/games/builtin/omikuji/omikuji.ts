import type { FirebotGame } from "../../../../types/games";
import omikujiCommand from "./omikuji-command";

const game: FirebotGame = {
    id: "firebot-omikuji",
    name: "おみくじ",
    subtitle: "おみくじを引きます",
    description: "おみくじをひきます。!omikuji と入力して、おみくじを決定します",
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
                    title: "おみくじ金額",
                    description: "おみくじを引くのに必要な金額。",
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
        omikujiSettings: {
            title: "回転設定",
            sortRank: 2,
            settings: {
                OmikujiSpec: {
                    type: "string",
                    title: "おみくじの種類",
                    description: "おみくじの役名を1行1役で入れます",
                    useTextArea: true,
                    default: "大吉\n小吉\n吉\n末吉\n凶\n大凶",
                    tip: "2つ以上入れましょう",
                    sortRank: 1,
                    validation: {
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
                    title: "すでに、おみくじ中",
                    description: "おみくじの指示が速すぎる場合（不要なら空欄）",
                    useTextArea: true,
                    default: "{displayName}さん、今おみくじを引いているところですよ",
                    tip: "有効な変数: {username}, {displayName}",
                    sortRank: 1
                },
                onCooldown: {
                    type: "string",
                    title: "再実行までの待ち時間中",
                    description: "ユーザーが待ち時間中のとき（不要なら空欄）",
                    useTextArea: true,
                    default: "{displayName}さん, 再度おみくじを引くまでの残り時間: {timeRemaining}",
                    tip: "有効な変数: {username}, {timeRemaining}, {displayName}",
                    sortRank: 2
                },
                notEnough: {
                    type: "string",
                    title: "不十分",
                    description: "必要資金が足りない場合（不要なら空欄）",
                    useTextArea: true,
                    default: "{displayName}さん, おみくじを引く資金が足りません",
                    tip: "有効な変数: {username}, {displayName}",
                    sortRank: 8
                },
                OmikujiInAction: {
                    type: "string",
                    title: "おみくじ中",
                    description: "おみくじ実行中（不要なら空欄）",
                    useTextArea: true,
                    default: "{displayName}さんの運勢は...",
                    tip: "有効な変数: {username}, {displayName}",
                    sortRank: 9
                },
                OmikujiSuccessful: {
                    type: "string",
                    title: "おみくじ完了",
                    description: "おみくじ終了時（不要なら空欄）",
                    useTextArea: true,
                    default: "{displayName}さんの運勢は {omikujiResult} でした！",
                    tip: "有効な変数: {username}, {omikujiResult}, {displayName}",
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
        omikujiCommand.registerOmikujiCommand();
    },
    onUnload: () => {
        omikujiCommand.unregisterOmikujiCommand();
        omikujiCommand.purgeCaches();
    },
    onSettingsUpdate: () => {
        omikujiCommand.purgeCaches();
    }
};

export = game;
