"use strict";

const util = require("../../../utility");
const twitchChat = require("../../../chat/twitch-chat");
const commandManager = require("../../../chat/commands/CommandManager");
const gameManager = require("../../game-manager");
const currencyDatabase = require("../../../database/currencyDatabase");
const moment = require("moment");
const NodeCache = require("node-cache");

let activeBiddingInfo = {
    "active": false,
    "currentBid": 0,
    "topBidder": ""
};
let bidTimer;
const cooldownCache = new NodeCache({checkperiod: 5});
const BID_COMMAND_ID = "firebot:bid";

function purgeCaches() {
    cooldownCache.flushAll();
    activeBiddingInfo = {
        "active": false,
        "currentBid": 0,
        "topBidder": ""
    };
}

async function stopBidding(chatter) {
    clearTimeout(bidTimer);
    if (activeBiddingInfo.topBidder) {
        await twitchChat.sendChatMessage(`${activeBiddingInfo.topBidderDisplayName} 縺・${activeBiddingInfo.currentBid} 繧定誠譛ｭ縺励◆縲Ａ, null, chatter);
    } else {
        await twitchChat.sendChatMessage(`隱ｰ繧ょ・譛ｭ縺励↑縺九▲縺溘・縺ｧ縲∝享閠・・縺・↑縺・ｼ～, null, chatter);
    }

    purgeCaches();
}

const bidCommand = {
    definition: {
        id: BID_COMMAND_ID,
        name: "Bid",
        active: true,
        trigger: "!bid",
        description: "隕冶・閠・′蜈･譛ｭ繧ｲ繝ｼ繝縺ｫ蜿ょ刈縺ｧ縺阪ｋ繧医≧縺ｫ縺吶ｋ縲・,
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        hideCooldowns: true,
        subCommands: [
            {
                id: "bidStart",
                arg: "start",
                usage: "start [currencyAmount]",
                description: "謖・ｮ壹＆繧後◆驥鷹｡阪〒蜈･譛ｭ繧帝幕蟋九☆繧九・,
                hideCooldowns: true,
                restrictionData: {
                    restrictions: [
                        {
                            id: "sys-cmd-mods-only-perms",
                            type: "firebot:permissions",
                            mode: "roles",
                            roleIds: [
                                "broadcaster",
                                "mod"
                            ]
                        }
                    ]
                }
            },
            {
                id: "bidStop",
                arg: "stop",
                usage: "stop",
                description: "謇句虚縺ｧ蜈･譛ｭ繧呈ｭ｢繧√ｋ縲よ怙鬮倬｡榊・譛ｭ閠・′關ｽ譛ｭ縺吶ｋ縲・,
                hideCooldowns: true,
                restrictionData: {
                    restrictions: [
                        {
                            id: "sys-cmd-mods-only-perms",
                            type: "firebot:permissions",
                            mode: "roles",
                            roleIds: [
                                "broadcaster",
                                "mod"
                            ]
                        }
                    ]
                }
            },
            {
                id: "bidAmount",
                arg: "\\d+",
                regex: true,
                usage: "[currencyAmount]",
                description: "謖・ｮ壹＆繧後◆驥鷹｡阪〒蜈･譛ｭ縺ｫ蜿ょ刈縺吶ｋ.",
                hideCooldowns: true
            }
        ]
    },
    onTriggerEvent: async event => {
        const { chatMessage, userCommand } = event;

        const bidSettings = gameManager.getGameSettings("firebot-bid");
        const chatter = bidSettings.settings.chatSettings.chatter;

        const currencyId = bidSettings.settings.currencySettings.currencyId;
        const currency = currencyDatabase.getCurrencyById(currencyId);
        const currencyName = currency.name;

        if (event.userCommand.subcommandId === "bidStart") {
            const triggeredArg = userCommand.args[1];
            const bidAmount = parseInt(triggeredArg);

            if (isNaN(bidAmount)) {
                await twitchChat.sendChatMessage(`辟｡蜉ｹ縺ｪ驥鷹｡阪〒縺吶ょ・譛ｭ繧帝幕蟋九☆繧九↓縺ｯ謨ｰ蟄励ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞縲Ａ, null, chatter, chatMessage.id);
                return;
            }

            if (activeBiddingInfo.active !== false) {
                await twitchChat.sendChatMessage(`縺吶〒縺ｫ蜈･譛ｭ縺瑚｡後ｏ繧後※縺・∪縺吶・邨ゆｺ・☆繧九↓縺ｯ !bid stop 縺ｨ蜈･蜉帙＠縺ｦ縺上□縺輔＞`, null, chatter, chatMessage.id);
                return;
            }

            if (bidAmount < bidSettings.settings.currencySettings.minBid) {
                await twitchChat.sendChatMessage(`繧ｹ繧ｿ繝ｼ繝井ｾ｡譬ｼ縺ｯ縲・{bidSettings.settings.currencySettings.minBid} 莉･荳雁ｿ・ｦ√〒縺吶・`, null, chatter, chatMessage.id);
                return;
            }

            activeBiddingInfo = {
                "active": true,
                "currentBid": bidAmount,
                "topBidder": ""
            };

            const raiseMinimum = bidSettings.settings.currencySettings.minIncrement;
            const minimumBidWithRaise = activeBiddingInfo.currentBid + raiseMinimum;
            await twitchChat.sendChatMessage(`${bidAmount} ${currencyName}縺ｧ蜈･譛ｭ繧帝幕蟋九＠縺ｾ縺励◆縲・!bid ${minimumBidWithRaise} 縺ｨ謇薙▽縺ｨ縺ｧ蜈･譛ｭ縺励∪縺兪, null, chatter);

            const timeLimit = bidSettings.settings.timeSettings.timeLimit * 60000;
            bidTimer = setTimeout(async () => {
                await stopBidding(chatter);
            }, timeLimit);

        } else if (event.userCommand.subcommandId === "bidStop") {
            await stopBidding(chatter);
        } else if (event.userCommand.subcommandId === "bidAmount") {

            const triggeredArg = userCommand.args[0];
            const bidAmount = parseInt(triggeredArg);
            const username = userCommand.commandSender;

            if (activeBiddingInfo.active === false) {
                await twitchChat.sendChatMessage(`迴ｾ蝨ｨ縲∝・譛ｭ縺ｯ陦後ｏ繧後※縺・∪縺帙ｓ縲Ａ, null, chatter, chatMessage.id);
                return;
            }

            const cooldownExpireTime = cooldownCache.get(username);
            if (cooldownExpireTime && moment().isBefore(cooldownExpireTime)) {
                const timeRemainingDisplay = util.secondsForHumans(Math.abs(moment().diff(cooldownExpireTime, 'seconds')));
                await twitchChat.sendChatMessage(`谺｡縺ｮ蜈･譛ｭ髢句ｧ九ｒ縺雁ｾ・■縺上□縺輔＞ 蠕・■譎る俣・・${timeRemainingDisplay} `, null, chatter, chatMessage.id);
                return;
            }

            if (activeBiddingInfo.topBidder === username) {
                await twitchChat.sendChatMessage("縺ゅ↑縺溘・譛鬮伜・譛ｭ閠・〒縺吶りｿｽ蜉蜈･譛ｭ縺ｯ縺ｧ縺阪∪縺帙ｓ縲・, null, chatter, chatMessage.id);
                return;
            }

            if (bidAmount < 1) {
                await twitchChat.sendChatMessage("蜈･譛ｭ驥鷹｡阪・ 0 繧医ｊ螟ｧ縺阪￥縺励※縺上□縺輔＞縲・, null, chatter, chatMessage.id);
                return;
            }

            const minBid = bidSettings.settings.currencySettings.minBid;
            if (minBid != null & minBid > 0) {
                if (bidAmount < minBid) {
                    await twitchChat.sendChatMessage(`蜈･譛ｭ鬘阪・蟆代↑縺上→繧・${minBid} ${currencyName} 莉･荳雁ｿ・ｦ√〒縺・`, null, chatter, chatMessage.id);
                    return;
                }
            }

            const userBalance = await currencyDatabase.getUserCurrencyAmount(username, currencyId);
            if (userBalance < bidAmount) {
                await twitchChat.sendChatMessage(`${currencyName} 縺御ｸ崎ｶｳ縺励※縺・∪縺兪, null, chatter, chatMessage.id);
                return;
            }

            const raiseMinimum = bidSettings.settings.currencySettings.minIncrement;
            const minimumBidWithRaise = activeBiddingInfo.currentBid + raiseMinimum;
            if (bidAmount < minimumBidWithRaise) {
                await twitchChat.sendChatMessage(`蟆代↑縺上→繧・${minimumBidWithRaise} ${currencyName} 縺ｯ蠢・ｦ√〒縺・`, null, chatter, chatMessage.id);
                return;
            }

            const previousHighBidder = activeBiddingInfo.topBidder;
            const previousHighBidAmount = activeBiddingInfo.currentBid;
            if (previousHighBidder != null && previousHighBidder !== "") {
                await currencyManager.adjustCurrencyForViewer(previousHighBidder, currencyId, previousHighBidAmount);
                await twitchChat.sendChatMessage(`關ｽ譛ｭ縺輔ｌ縺ｾ縺励◆・・${previousHighBidAmount} ${currencyName} 縺瑚ｿ秘≡縺輔ｌ縺ｾ縺励◆.`, null, chatter, chatMessage.id);
            }

            await currencyDatabase.adjustCurrencyForUser(username, currencyId, -Math.abs(bidAmount));
            const newTopBidWithRaise = bidAmount + raiseMinimum;
            await twitchChat.sendChatMessage(`${userDisplayName} 縺碁ｫ伜､繧呈峩譁ｰ縺励∪縺励◆縲・{bidAmount} ${currencyName}. 蜈･譛ｭ縺吶ｋ縺ｫ縺ｯ !bid ${newTopBidWithRaise} 縺九√◎繧御ｻ･荳翫・鬘阪ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞`);

            // eslint-disable-next-line no-use-before-define
            setNewHighBidder(username, bidAmount);

            const cooldownSecs = bidSettings.settings.cooldownSettings.cooldown;
            if (cooldownSecs && cooldownSecs > 0) {
                const expireTime = moment().add(cooldownSecs, 'seconds');
                cooldownCache.set(username, expireTime, cooldownSecs);
            }
        } else {
            await twitchChat.sendChatMessage(`蜈･譛ｭ繧ｳ繝槭Φ繝峨′荳肴ｭ｣縺ｧ縺吶ゆｽｿ縺・婿・・${userCommand.trigger} [驥鷹｡江`, null, chatter, chatMessage.id);
        }
    }
};

function registerBidCommand() {
    if (!commandManager.hasSystemCommand(BID_COMMAND_ID)) {
        commandManager.registerSystemCommand(bidCommand);
    }
}

function unregisterBidCommand() {
    commandManager.unregisterSystemCommand(BID_COMMAND_ID);
}

function setNewHighBidder(username, amount) {
    activeBiddingInfo.currentBid = amount;
    activeBiddingInfo.topBidder = username;
}

exports.purgeCaches = purgeCaches;
exports.registerBidCommand = registerBidCommand;
exports.unregisterBidCommand = unregisterBidCommand;
