"use strict";
const twitchChat = require("../../../chat/twitch-chat");
const util = require("../../../utility");

let staredtLottery = false;
let lotteryAmount=1;

async function lottery(activeLottery, chatter) {

    let successCount = 0;
    let lotteryWinners = [];


    await util.wait(2000);

    //全員が受かる場合
    if(lotteryAmount>=activeLottery.length){
        activeLottery.keys().forEach(async (key) => 
        {
            lotteryWinners.push(key);
        });
    }
    else{

        while(lotteryAmount>=lotteryWinners.length)
        {
            var seed = Date.now(); 
            var randomIndex = Math.floor( (seed^4) % activeLottery.length);
            var winnerItem = activeLottery[randomIndex];

            if (!lotteryWinners.includes(winnerItem)) {
                lotteryWinners.push(winnerItem);
            }
        }        
    }

    if (lotterySettings.settings.generalMessages.LotterySuccessful) {
        lotteryWinners.keys().forEach(async (key) => 
        {
            const LotterySuccessfulMsg = lotterySettings.settings.generalMessages.LotterySuccessful
                .replace("{username}", key.username)
                .replace("{displayName}", key.displayName);

            await twitchChat.sendChatMessage(LotterySuccessfulMsg, null, chatter);
        });
    }
    return ;
}

exports.clearCooldowns = () => {
    usersInLottery = [];
};

exports.lottery = lottery;