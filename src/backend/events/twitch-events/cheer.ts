import eventManager from "../../events/EventManager";

export function triggerCheer(
<<<<<<< HEAD
    userName: string,
    displayName: string,
=======
    username: string,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
    userId: string,
    isAnonymous: boolean,
    bits: number,
    totalBits: number,
    cheerMessage: string
): void {
    eventManager.triggerEvent("twitch", "cheer", {
<<<<<<< HEAD
        username: userName,
        displayName: displayName,
=======
        username,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        userId,
        isAnonymous,
        bits,
        totalBits,
        cheerMessage
    });
}

export function triggerBitsBadgeUnlock(
<<<<<<< HEAD
    userName: string,
    displayName: string,
=======
    username: string,
    userId: string,
    userDisplayName: string,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
    message: string,
    badgeTier: number
): void {
    eventManager.triggerEvent("twitch", "bits-badge-unlocked", {
<<<<<<< HEAD
        username: userName,
        displayName: displayName,
=======
        username,
        userId,
        userDisplayName,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        message,
        badgeTier
    });
}