import { TwitchApi } from "../../../streaming-platforms/twitch/api";
import { wait } from "../../../utils";

export async function omikuji(
    showOmikujiInActionMsg: boolean,
    omikujiInActionMsg: string,
    omikujiSpec: string,
    sendAsBot: boolean
): Promise<string> {
    if (showOmikujiInActionMsg) {
        await TwitchApi.chat.sendChatMessage(omikujiInActionMsg, null, sendAsBot);
    }

    await wait(2000);

    const omikujiSpecArray = omikujiSpec.split("\n").filter(v => v?.trim()?.length > 0);
    if (omikujiSpecArray.length < 1) {
        return "";
    }

    const seed = Date.now();
    const randomIndex = Math.floor(seed % omikujiSpecArray.length);
    return omikujiSpecArray[randomIndex];
}
