import eventManager from "../EventManager";

export function triggerTimeout(
<<<<<<< HEAD
    userName: string,
=======
    username: string,
    userId: string,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
    userDisplayName: string,
    timeoutDuration: string | number,
<<<<<<< HEAD
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
=======
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
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        modReason
    });
}