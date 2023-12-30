import eventManager from "../../events/EventManager";

export function triggerCheer(
    userName: string,
    displayName: string,
    userId: string,
    isAnonymous: boolean,
    bits: number,
    totalBits: number,
    cheerMessage: string
): void {
    eventManager.triggerEvent("twitch", "cheer", {
        username: userName,
        displayName: displayName,
        userId,
        displayName: displayName,
        isAnonymous,
        bits,
        totalBits,
        cheerMessage
    });
}

export function triggerBitsBadgeUnlock(
    userName: string,
    displayName: string,
    message: string,
    badgeTier: number
): void {
    eventManager.triggerEvent("twitch", "bits-badge-unlocked", {
        username: userName,
        displayName: displayName,
        message,
        badgeTier
    });
}