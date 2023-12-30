import eventManager from "../EventManager";

export function triggerBanned(
    userName: string,
    userDisplayName: string,
    moderatorName: string,
    moderatorDisplayName: string,
    modReason: string
): void {
    eventManager.triggerEvent("twitch", "banned", {
        username: userName,
        displayName: userDisplayName,
        moderatorName,
        moderatorDisplayName,
        modReason
    });
}

export function triggerUnbanned(
    userName: string,
    userDisplayName: string,
    moderatorName: string,
    moderatorDisplayName: string,
) {
    eventManager.triggerEvent("twitch", "unbanned", {
        username: userName,
        displayName: userDisplayName,
        moderatorName,
        moderatorDisplayName
    });
}