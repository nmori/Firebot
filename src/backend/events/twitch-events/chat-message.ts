import { FirebotChatMessage } from "../../chat/chat-helpers";
import eventManager from "../../events/EventManager";

export function triggerChatMessage(firebotChatMessage: FirebotChatMessage): void {
    eventManager.triggerEvent("twitch", "chat-message", {
        userId: firebotChatMessage.userId,
        userIdName: firebotChatMessage.useridname,
        username: firebotChatMessage.useridname,
        displayName:firebotChatMessage.displayName,
        twitchUserRoles: firebotChatMessage.roles,
        messageText: firebotChatMessage.rawText,
        chatMessage: firebotChatMessage
    });
};