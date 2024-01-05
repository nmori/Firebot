import eventManager from "../../events/EventManager";

export function triggerShoutoutSent(
    userName: string,
    userDisplayName: string,
    moderatorName: string,
    viewerCount: number
) {
    eventManager.triggerEvent("twitch", "shoutout-sent", {
        username: userName,
        displayName: userDisplayName,
        moderator: moderatorName,
        viewerCount
    });
}

export function triggerShoutoutReceived(
    userName: string,
    userDisplayName: string,
    viewerCount: number
) {
    eventManager.triggerEvent("twitch", "shoutout-received", {
        username: userName,
        displayName: userDisplayName,
        viewerCount
    });
}