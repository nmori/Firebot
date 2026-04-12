import eventManager from "../EventManager";

export function triggerTimeout(
    username: string,
    userId: string,
    userDisplayName: string,
    timeoutDuration: string | number,
    modReason: string
): void {
    eventManager.triggerEvent("twitch", "timeout", {
        username,
        userId,
        userDisplayName,
        moderatorUsername,
        moderatorId,
        moderatorDisplayName,
        moderator: moderatorDisplayName,
        timeoutDuration,
        modReason
    });
}
