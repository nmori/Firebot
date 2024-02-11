import eventManager from "../../events/EventManager";

export function triggerRaid(
    username: string,
    userId: string,
    userDisplayName: string,
    viewerCount = 0
): void {
    eventManager.triggerEvent("twitch", "raid", {
        username: username,
        displayName: userDisplayName,
        userIdName: username,
        userId,
        viewerCount
    });
}