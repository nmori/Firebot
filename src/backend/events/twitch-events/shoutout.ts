import eventManager from "../../events/EventManager";

export function triggerShoutoutSent(
<<<<<<< HEAD
    userName: string,
    userDisplayName: string,
    moderatorName: string,
    viewerCount: number
) {
    eventManager.triggerEvent("twitch", "shoutout-sent", {
        username: userName,
        displayName: userDisplayName,
        moderator: moderatorName,
=======
    username: string,
    userId: string,
    userDisplayName: string,
    moderatorUsername: string,
    moderatorId: string,
    moderatorDisplayName: string,
    viewerCount: number
) {
    eventManager.triggerEvent("twitch", "shoutout-sent", {
        username,
        userId,
        userDisplayName,
        moderatorUsername,
        moderatorId,
        moderatorDisplayName,
        moderator: moderatorDisplayName,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        viewerCount
    });
}

export function triggerShoutoutReceived(
<<<<<<< HEAD
    userName: string,
=======
    username: string,
    userId: string,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
    userDisplayName: string,
    viewerCount: number
) {
    eventManager.triggerEvent("twitch", "shoutout-received", {
<<<<<<< HEAD
        username: userName,
        displayName: userDisplayName,
=======
        username,
        userId,
        userDisplayName,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        viewerCount
    });
}