import eventManager from "../../events/EventManager";

export function triggerWhisper(
<<<<<<< HEAD
    userName: string,
=======
    username: string,
    userId: string,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
    userDisplayName: string,
    message: string,
    sentTo: "streamer" | "bot"
): void {
    eventManager.triggerEvent("twitch", "whisper", {
<<<<<<< HEAD
        username: userName,
        displayName: userDisplayName,
=======
        username,
        userId,
        userDisplayName,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        message,
        sentTo
    });
}