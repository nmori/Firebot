"use strict";
const twitchChat = require("../../../chat/twitch-chat");
const util = require("../../../utility");

async function omikuji(showSpinInActionMsg, spinInActionMsg, OmikujiSpec, chatter) {

    let successCount = 0;

    if (showSpinInActionMsg) {
        await twitchChat.sendChatMessage(spinInActionMsg, null, chatter);
    }

    await util.wait(2000);

    var omikujiSpecArray = OmikujiSpec.split('\n');

    var seed = Date.now(); 
    var randomIndex = Math.floor(seed % omikujiSpecArray.length);
    var randomElement = omikujiSpecArray[randomIndex];
    return randomElement;
}

exports.omikuji = omikuji;