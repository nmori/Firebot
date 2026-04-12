import eventManager from "../../events/EventManager";

export function triggerSub(
    userName: string,
    userId: string,
    userDisplayName: string,
    subPlan: string,
    totalMonths: number,
    subMessage: string,
    streak: number,
    isPrime: boolean,
    isResub: boolean
): void {
    eventManager.triggerEvent("twitch", "sub", {
<<<<<<< HEAD
        userIdName: userName,
        username: userName,
        displayName:userDisplayName,
=======
        username,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        userId,
        subPlan,
        totalMonths,
        subMessage,
        streak,
        isPrime,
        isResub
    });
}

export function triggerPrimeUpgrade(
    username: string,
    userDisplayName: string,
    userId: string,
    subPlan: string
 ): void {
    eventManager.triggerEvent("twitch", "prime-sub-upgraded", {
<<<<<<< HEAD
        username: username,
        displayName:userDisplayName,
        userIdName: username,
=======
        username,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        userId,
        subPlan
    });
}