import type { FirebotGame } from "../../../../types/games";
import otoshidamaCommand from "./otoshidama-command";

const game: FirebotGame = {
    id: "firebot-otoshidama",
    name: "お年玉",
    subtitle: "お年玉ちょうだい！",
    description: "!otoshidama と入力して、お年玉をもらいます。",
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
                OmikujiSpec: {
                    type: "string",
                    title: "お年玉の額",
                    description: "候補金額を1行ずつ入れます",
                    useTextArea: true,
                    default: "1\n100\n200\n500\n1000",
                    tip: "2つ以上入れましょう",
                    sortRank: 2,
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
                    title: "すでに、お年玉おねだり中",
                    description: "おねだりが速すぎる場合（不要なら空欄）",
                    useTextArea: true,
                    default: "{displayName}さん、せっかちですよ",
                    tip: "有効な変数: {username}, {displayName}",
                    sortRank: 1
                },
                onCooldown: {
                    type: "string",
                    title: "再実行までの待ち時間中",
                    description: "ユーザーが待ち時間中のとき（不要なら空欄）",
                    useTextArea: true,
                    default: "{displayName}さん, さっきもらったじゃないですか〜: {timeRemaining}",
                    tip: "有効な変数: {username}, {timeRemaining}, {displayName}",
                    sortRank: 2
                },
                OmikujiSuccessful: {
                    type: "string",
                    title: "お年玉完了",
                    description: "お年玉を渡した時（不要なら空欄）",
                    useTextArea: true,
                    default: "{displayName}さん、お年玉を差し上げます！ （{otoshidamaResult} {currencyName}）",
                    tip: "有効な変数: {username}, {otoshidamaResult}, {displayName}, {currencyName}",
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
        otoshidamaCommand.registerOmikujiCommand();
    },
    onUnload: () => {
        otoshidamaCommand.unregisterOmikujiCommand();
        otoshidamaCommand.purgeCaches();
    },
    onSettingsUpdate: () => {
        otoshidamaCommand.purgeCaches();
    }
};

export = game;
