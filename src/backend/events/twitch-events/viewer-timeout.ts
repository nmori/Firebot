import eventManager from "../EventManager";

export function triggerTimeout(
    userName: string,
    userDisplayName: string,
    timeoutDuration: string | number,
    moderatorUserName: string,
    moderatorDisplayName: string,
    modReason: string
): void {
    eventManager.triggerEvent("twitch", "timeout", {
        username: userName,
        displayName: userDisplayName,
        timeoutDuration,
        moderatorUserName:moderatorUserName,
        moderatorDisplayName:moderatorDisplayName,
        modReason
    });
}