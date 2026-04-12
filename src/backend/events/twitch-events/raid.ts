import eventManager from "../../events/EventManager";

export function triggerRaid(
    username: string,
    userId: string,
    userDisplayName: string,
    viewerCount = 0
): void {
    eventManager.triggerEvent("twitch", "raid", {
<<<<<<< HEAD
        username: username,
        displayName:userDisplayName,
        userIdName: username,
=======
        username,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        userId,
        viewerCount
    });
}