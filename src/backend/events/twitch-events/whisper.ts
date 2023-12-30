import eventManager from "../../events/EventManager";

export function triggerWhisper(
    userName: string,
    userDisplayName: string,
    message: string
): void {
    eventManager.triggerEvent("twitch", "whisper", {
        username: userName,
        displayName: userDisplayName,
        message
    });
}