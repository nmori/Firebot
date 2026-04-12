import { FirebotChatMessage } from "../../../types/chat";
import eventManager from "../../events/EventManager";

export function triggerChatMessage(firebotChatMessage: FirebotChatMessage): void {
    eventManager.triggerEvent("twitch", "chat-message", {
<<<<<<< HEAD
        userId: firebotChatMessage.userId,
        userIdName: firebotChatMessage.userIdName,
        username: firebotChatMessage.username,
        displayName:firebotChatMessage.displayName,
=======
        username: firebotChatMessage.username,
        userId: firebotChatMessage.userId,
        userDisplayName: firebotChatMessage.userDisplayName,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        twitchUserRoles: firebotChatMessage.roles,
        messageText: firebotChatMessage.rawText,
        chatMessage: firebotChatMessage
    });
}

export function triggerFirstTimeChat(firebotChatMessage: FirebotChatMessage): void {
    eventManager.triggerEvent("twitch", "first-time-chat", {
<<<<<<< HEAD
        userId: firebotChatMessage.userId,
        userIdName: firebotChatMessage.userIdName,
        username: firebotChatMessage.username,
        displayName:firebotChatMessage.displayName,
=======
        username: firebotChatMessage.username,
        userId: firebotChatMessage.userId,
        userDisplayName: firebotChatMessage.userDisplayName,
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        twitchUserRoles: firebotChatMessage.roles,
        messageText: firebotChatMessage.rawText,
        chatMessage: firebotChatMessage
    });
}