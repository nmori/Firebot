"use strict";
const twitchChat = require("../../../chat/twitch-chat");
const util = require("../../../utility");

async function otoshidama(OtoshidamaSpec, chatter) {

    let successCount = 0;

    await util.wait(2000);

    var otoshidamaSpecArray = OtoshidamaSpec.split('\n');

    var seed = Date.now(); 
    var randomIndex = Math.floor(seed % otoshidamaSpecArray.length);
    var randomElement = otoshidamaSpecArray[randomIndex];
    return randomElement;
}

exports.otoshidama = otoshidama;