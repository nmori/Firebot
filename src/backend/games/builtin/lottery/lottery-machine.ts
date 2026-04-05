import { TwitchApi } from "../../../streaming-platforms/twitch/api";
import { wait } from "../../../utils";

interface LotteryUser {
    username: string;
    displayName: string;
}

export async function lottery(
    activeLottery: string[],
    usersByName: Map<string, LotteryUser>,
    winnerCount: number,
    lotterySuccessfulTemplate: string,
    sendAsBot: boolean
): Promise<void> {
    const lotteryWinners: string[] = [];

    await wait(2000);

    if (winnerCount >= activeLottery.length) {
        lotteryWinners.push(...activeLottery);
    } else {
        while (winnerCount > lotteryWinners.length) {
            const seed = Date.now();
            const randomIndex = Math.floor((seed ^ 4) % activeLottery.length);
            const winnerItem = activeLottery[randomIndex];

            if (!lotteryWinners.includes(winnerItem)) {
                lotteryWinners.push(winnerItem);
            }
        }
    }

    for (const key of lotteryWinners) {
        const user = usersByName.get(key);
        if (user == null) {
            continue;
        }

        const lotterySuccessfulMsg = lotterySuccessfulTemplate
            .replaceAll("{username}", user.username)
            .replaceAll("{displayName}", user.displayName);

        await TwitchApi.chat.sendChatMessage(lotterySuccessfulMsg, null, sendAsBot);
    }
}
