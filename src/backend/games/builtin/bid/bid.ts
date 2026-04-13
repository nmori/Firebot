import type { FirebotGame } from "../../../../types/games";
import bidCommand from "./bid-command";

const game: FirebotGame = {
    id: "firebot-bid",
    name: "入札",
    subtitle: "オークション形式で競り合う",
    description: "配信者（またはモデレーター）がオークションを開始し、視聴者が通貨を使って入札できるゲームです。!bid [金額] で参加でき、上回られた入札者には通貨が返金されます。最終的な落札者は入札額分の通貨を消費します。",
    icon: "fa-gavel",
    settingCategories: {
        currencySettings: {
            title: "通貨設定",
            sortRank: 1,
            settings: {
                currencyId: {
                    type: "currency-select",
                    title: "通貨",
                    description: "入札で使用する通貨。",
                    sortRank: 1,
                    validation: {
                        required: true
                    }
                },
                minBid: {
                    type: "number",
                    title: "最低開始入札額",
                    placeholder: "金額を入力",
                    description: "開始入札の最低金額。",
                    tip: "任意",
                    default: 1,
                    sortRank: 2,
                    validation: {
                        min: 1
                    }
                },
                minIncrement: {
                    type: "number",
                    title: "最低入札増加額",
                    placeholder: "金額を入力",
                    description: "現在の最高入札額より少なくともこの金額以上入札する必要があります。",
                    tip: "任意",
                    default: 1,
                    sortRank: 4,
                    validation: {
                        min: 1
                    }
                }
            }
        },
        timeSettings: {
            title: "時間設定",
            sortRank: 2,
            settings: {
                timeLimit: {
                    type: "number",
                    title: "制限時間（分）",
                    placeholder: "分を入力",
                    description: "この時間が経過した時点で最高入札者が落札します。",
                    tip: "任意",
                    default: 2,
                    sortRank: 1,
                    validation: {
                        min: 1
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
                    description: "視聴者ごとのクールダウン。この頻度でしか入札できません。",
                    tip: "任意",
                    default: 5,
                    validation: {
                        min: 0
                    }
                }
            }
        },
        chatSettings: {
            title: "チャット設定",
            sortRank: 4,
            settings: {
                chatter: {
                    type: "chatter-select",
                    title: "発言者"
                }
            }
        }
    },
    onLoad: () => {
        bidCommand.registerBidCommand();
    },
    onUnload: () => {
        bidCommand.unregisterBidCommand();
        bidCommand.purgeCaches();
    },
    onSettingsUpdate: () => {
        bidCommand.purgeCaches();
    }
};

export = game;