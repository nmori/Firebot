"use strict";
const twitchChat = require("../../../chat/twitch-chat");
const { wait } = require("../../../utils/async");
const util = { wait };

async function omikuji(showOmikujiInActionMsg, OmikujiInActionMsg, OmikujiSpec, chatter) {

    let successCount = 0;

    if (showOmikujiInActionMsg) {
        await twitchChat.sendChatMessage(OmikujiInActionMsg, null, chatter);
    }

    await util.wait(2000);

    var omikujiSpecArray = OmikujiSpec.split('\n');

    var seed = Date.now(); 
    var randomIndex = Math.floor(seed % omikujiSpecArray.length);
    var randomElement = omikujiSpecArray[randomIndex];
    return randomElement;
}

exports.omikuji = omikuji;