import eventManager from "../../events/EventManager";

export function triggerFollow(
    userId: string,
    userName: string,
    userDisplayName: string
): void {
    eventManager.triggerEvent("twitch", "follow", {
        userId,
<<<<<<< HEAD
        username: userName,
        displayName:userDisplayName,
        userIdName: userName
=======
        userDisplayName
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
    });
}