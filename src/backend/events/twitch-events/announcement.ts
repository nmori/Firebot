import eventManager from "../EventManager";

export function triggerAnnouncement(
    userName: string,
    userId: string,
    userDisplayName: string,
    twitchUserRoles: string[],
    messageText: string
): void {
    eventManager.triggerEvent("twitch", "announcement", {
        userIdName: userName,
        userId,
        username: userName,
        displayName: userDisplayName,
        twitchUserRoles,
        messageText
    });
};