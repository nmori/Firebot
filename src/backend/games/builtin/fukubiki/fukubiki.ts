import type { FirebotGame, GameSettings } from "../../../../types/games";
import fukubikiCommand from "./fukubiki-command";
import { initializePrizeStocks, type FukubikiPrize } from "./fukubiki-machine";

const DEFAULT_PRIZES: FukubikiPrize[] = [
    {
        id: "default-1",
        name: "1等",
        chance: 5,
        stock: 3,
        message: "{displayName}さん、1等おめでとうございます！🎉",
        whisperMessage: ""
    },
    {
        id: "default-2",
        name: "2等",
        chance: 15,
        stock: 10,
        message: "{displayName}さん、2等当選！🎊",
        whisperMessage: ""
    },
    {
        id: "default-3",
        name: "3等",
        chance: 30,
        stock: 0,
        message: "{displayName}さん、3等当選！",
        whisperMessage: ""
    },
    {
        id: "default-hazure",
        name: "ハズレ",
        chance: 50,
        stock: 0,
        message: "{displayName}さん、残念でした…またチャレンジしてください！",
        whisperMessage: ""
    }
];

const game: FirebotGame = {
    id: "firebot-fukubiki",
    name: "福引き",
    subtitle: "福引きを引きます",
    description: "!fukubiki と入力して、福引きに挑戦します。賞の名前・確率・ストック数・チャットメッセージを自由に設定できます。",
    icon: "fa-solid fa-gift",
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
                    title: "抽選費用",
                    description: "福引きを引くのに必要な金額（0なら無料）",
                    placeholder: "金額を入れる",
                    default: 100,
                    sortRank: 2,
                    validation: {
                        min: 0,
                        required: true
                    }
                }
            }
        },
        fukubikiSettings: {
            title: "福引き設定",
            sortRank: 2,
            settings: {
                prizes: {
                    type: "fukubiki-prize-list" as unknown as "string",
                    title: "賞の一覧",
                    description: "賞を追加・編集・削除できます。{displayName}/{username}/{prizeName} が使えます。",
                    default: DEFAULT_PRIZES,
                    sortRank: 1,
                    validation: {
                        required: true
                    }
                },
                maxDrawsPerUser: {
                    type: "number",
                    title: "一人当たりの引ける回数",
                    description: "1人が福引きを引ける最大回数。0なら無制限。",
                    default: 1,
                    sortRank: 2,
                    validation: {
                        min: 0
                    }
                }
            }
        },
        overlaySettings: {
            title: "オーバーレイ設定",
            sortRank: 3,
            settings: {
                useOverlay: {
                    type: "boolean",
                    title: "オーバーレイで結果を表示",
                    description: "ON にすると、抽選結果をオーバーレイに表示します",
                    default: false,
                    sortRank: 1
                },
                overlayDuration: {
                    type: "number",
                    title: "表示時間 (秒)",
                    description: "オーバーレイの表示時間（秒）",
                    default: 5,
                    sortRank: 2,
                    validation: {
                        min: 1
                    }
                },
                fontSize: {
                    type: "number",
                    title: "フォントサイズ (px)",
                    default: 36,
                    sortRank: 3,
                    validation: {
                        min: 8,
                        max: 200
                    }
                },
                fontColor: {
                    type: "string",
                    title: "フォントカラー (例: #FFFFFF)",
                    default: "#FFFFFF",
                    sortRank: 4
                },
                overlayInstance: {
                    type: "string",
                    title: "オーバーレイインスタンス名",
                    description: "空欄の場合はデフォルトのオーバーレイを使用",
                    default: "",
                    sortRank: 5
                }
            }
        },
        cooldownSettings: {
            title: "クールダウン設定",
            sortRank: 4,
            settings: {
                cooldown: {
                    type: "number",
                    title: "クールダウン時間 (秒)",
                    placeholder: "時間を入れる",
                    tip: "クールダウンは視聴者ごとに適用されます",
                    default: 0,
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
                onCooldown: {
                    type: "string",
                    title: "クールダウン中",
                    description: "クールダウン中のときに表示するメッセージ（不要なら空欄）",
                    useTextArea: true,
                    default: "{displayName}さん、再度福引きを引けるまでの残り時間: {timeRemaining}",
                    tip: "有効な変数: {username}, {displayName}, {timeRemaining}",
                    sortRank: 1
                },
                notEnough: {
                    type: "string",
                    title: "費用不足",
                    description: "費用が足りないときに表示するメッセージ（不要なら空欄）",
                    useTextArea: true,
                    default: "{displayName}さん、福引きを引くための費用が足りません",
                    tip: "有効な変数: {username}, {displayName}",
                    sortRank: 2
                },
                maxDrawsReached: {
                    type: "string",
                    title: "引ける回数の上限に達した",
                    description: "一人当たりの引ける回数の上限に達したときのメッセージ（不要なら空欄）",
                    useTextArea: true,
                    default: "{displayName}さん、今回の福引きの上限回数({maxDraws}回)に達しています",
                    tip: "有効な変数: {username}, {displayName}, {maxDraws}",
                    sortRank: 3
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
    onLoad: (settings: GameSettings) => {
        tryInitStocks(settings);
        fukubikiCommand.registerFukubikiCommand();
    },
    onUnload: () => {
        fukubikiCommand.unregisterFukubikiCommand();
        fukubikiCommand.purgeCaches();
    },
    onSettingsUpdate: (settings: GameSettings) => {
        fukubikiCommand.purgeCaches();
        tryInitStocks(settings);
    }
};

function tryInitStocks(settings: GameSettings): void {
    const prizes = settings?.settings?.fukubikiSettings?.prizes as FukubikiPrize[] | undefined;
    if (Array.isArray(prizes) && prizes.length > 0) {
        initializePrizeStocks(prizes);
    } else {
        initializePrizeStocks(DEFAULT_PRIZES);
    }
}

export = game;
