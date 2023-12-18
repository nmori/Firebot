"use strict";

const bidCommand = require("./bid-command");

/**
 * @type {import('../../game-manager').FirebotGame}
 */
module.exports = {
    id: "firebot-bid",
    name: "入札",
    subtitle: "オークションに出品する",
    description: "配信者（またはMOD）がオークションを開始し、視聴者が入札できます。景品ツールとして便利です！入札が始まったら、視聴者はチャットで'!bid [金額]'と入力できます。落札できなかったら通貨が戻ります。落札したら通貨を支払います。",
    icon: "fa-gavel",
    settingCategories: {
        currencySettings: {
            title: "通貨設定",
            sortRank: 1,
            settings: {
                currencyId: {
                    type: "currency-select",
                    title: "通貨",
                    description: "入札に使用する通貨。",
                    sortRank: 1,
                    validation: {
                        required: true
                    }
                },
                minBid: {
                    type: "number",
                    title: "最低開札価格",
                    placeholder: "金額を入れる",
                    description: "入札開始の最低金額",
                    tip: "任意",
                    default: 1,
                    sortRank: 2,
                    validation: {
                        min: 1
                    }
                },
                minIncrement: {
                    type: "number",
                    title: "最低入札額引き上げ",
                    placeholder: "金額を入れる",
                    description: "視聴者は最低でもこの金額以上の入札が必要になります",
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
                    description: "時間経過後、最高額で入札した者が落札します",
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
            title: "開始間隔",
            sortRank: 3,
            settings: {
                cooldown: {
                    type: "number",
                    title: "間隔 (秒)",
                    placeholder: "秒数を入力",
                    description: "間隔は視聴者ごとに適用されます。視聴者はこの間入札できません。",
                    tip: "任意",
                    default: 5,
                    validation: {
                        min: 0
                    }
                }
            }
        },
        chatSettings: {
            title: "チャット先",
            sortRank: 4,
            settings: {
                chatter: {
                    type: "chatter-select",
                    title: "アカウント"
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