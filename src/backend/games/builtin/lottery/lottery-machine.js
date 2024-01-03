"use strict";
const twitchChat = require("../../../chat/twitch-chat");
const util = require("../../../utility");

let startedLottery = false;
let lotteryAmount=1;

async function lottery(activeLottery, LotterySuccessful, chatter) {

    let successCount = 0;
    let lotteryWinners = [];

    var activeLotteryist = activeLottery.keys();

    await util.wait(2000);

    //全員が受かる場合
    if(lotteryAmount>=activeLotteryist.length){
        activeLotteryist.forEach(async (key) => 
        {
            lotteryWinners.push(key);
        });
    }else{

        while(lotteryAmount>lotteryWinners.length)
        {
            var seed = Date.now(); 
            var randomIndex = Math.floor( (seed^4) % activeLotteryist.length);
            var winnerItem = activeLotteryist[randomIndex];

            if (!lotteryWinners.includes(winnerItem)) {
                lotteryWinners.push(winnerItem);
            }
        }        
    }

    if (LotterySuccessful) {
        lotteryWinners.forEach(async (key) => 
        {
            var user=activeLottery.get(key);
            const LotterySuccessfulMsg = LotterySuccessful
                .replace("{username}", user.username)
                .replace("{displayName}", user.displayName);

            await twitchChat.sendChatMessage(LotterySuccessfulMsg, null, chatter);
        });
    }
    return ;
}
exports.lottery = lottery;