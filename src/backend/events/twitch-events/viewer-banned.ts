import eventManager from "../EventManager";

export function triggerBanned(
<<<<<<< HEAD
    userName: string,
    userDisplayName: string,
    moderatorName: string,
=======
    username: string,
    userId: string,
    userDisplayName: string,
    moderatorUsername: string,
    moderatorId: string,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
    moderatorDisplayName: string,
    modReason: string
): void {
    eventManager.triggerEvent("twitch", "banned", {
<<<<<<< HEAD
        username: userName,
        displayName: userDisplayName,
        moderatorName,
        moderatorDisplayName,
=======
        username,
        userId,
        userDisplayName,
        moderatorUsername,
        moderatorId,
        moderatorDisplayName,
        moderator: moderatorDisplayName,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        modReason
    });
}

export function triggerUnbanned(
<<<<<<< HEAD
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
=======
    username: string,
    userId: string,
    userDisplayName: string,
    moderatorUsername: string,
    moderatorId: string,
    moderatorDisplayName: string
) {
    eventManager.triggerEvent("twitch", "unbanned", {
        username,
        userId,
        userDisplayName,
        moderatorUsername,
        moderatorId,
        moderatorDisplayName,
        moderator: moderatorDisplayName
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
    });
}