import { FirebotChatMessage } from "../../../../../../types/chat";
import type { ReplaceVariable, TriggersObject } from "../../../../../../types/variables";

const triggers: TriggersObject = {};
triggers["manual"] = true;
triggers["command"] = true;
triggers["event"] = [
    "twitch:chat-message",
    "twitch:chat-message-deleted",
    "twitch:first-time-chat",
    "twitch:announcement",
    "twitch:viewer-arrived"
];

const model : ReplaceVariable = {
    definition: {
        handle: "sharedChatSourceUser",
        description: "Shared Chat メッセージの送信元ユーザー情報オブジェクト（userId, username, displayName）を出力します。Shared Chat でない場合は null です。",
        triggers: triggers,
        categories: ["common", "trigger based"],
        possibleDataOutput: ["object", "null"]
    },
    evaluator: (trigger) => {

        let chatMessage: FirebotChatMessage | null;
        if (trigger.metadata.chatMessage) {
            chatMessage = trigger.metadata.chatMessage;

        } else if (trigger.type === "event" || trigger.type === "manual") {
            chatMessage = trigger.metadata.eventData.chatMessage;
        }

        if (!chatMessage || !chatMessage.sharedChatRoomId) {
            return null;
        }

        return {
            userId: chatMessage.sharedChatRoomId,
            username: chatMessage.sharedChatRoomUsername,
            displayName: chatMessage.sharedChatRoomDisplayName,
            avatarUrl: chatMessage.sharedChatRoomProfilePicUrl
        };
    }
};

export default model;