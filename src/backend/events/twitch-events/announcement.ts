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
<<<<<<< HEAD
        username: userName,
        displayName:userDisplayName,
=======
        userDisplayName,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        twitchUserRoles,
        messageText
    });
}