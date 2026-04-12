import { FirebotChatMessage } from "../../../types/chat";
import eventManager from "../../events/EventManager";

export function triggerViewerArrived(
    userDisplayName: string,
    userName: string,
    userId: string,
    messageText: string,
    chatMessage: FirebotChatMessage
) {
    eventManager.triggerEvent("twitch", "viewer-arrived", {
<<<<<<< HEAD
        username: userName,
        displayName:userDisplayName,
        userIdName: userName,
=======
        username,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        userId,
        messageText,
        chatMessage
    });
}