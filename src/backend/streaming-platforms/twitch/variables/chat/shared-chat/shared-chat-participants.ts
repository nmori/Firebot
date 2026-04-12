import { AccountAccess } from "../../../../../common/account-access";
import type { ReplaceVariable, Trigger } from "../../../../../../types/variables";
import { SharedChatCache } from "../../../chat/shared-chat-cache";

const model : ReplaceVariable = {
    definition: {
        handle: "sharedChatParticipants",
        description: "Shared Chat 参加者オブジェクトの配列を返します（配信者アカウントを含む）。Shared Chat 中でない場合は空配列です。",
        examples: [
            {
                usage: "sharedChatParticipants[false]",
                description: "配列から配信者アカウントを除外します"
            },
            {
                usage: "sharedChatParticipants[true, username]",
                description: "参加者ユーザー名の配列を返します（配信者を含む）。"
            },
            {
                usage: "sharedChatParticipants[false, displayName]",
                description: "参加者表示名の配列を返します（配信者を除外）。"
            },
            {
                usage: "sharedChatParticipants[true, userId]",
                description: "参加者ユーザーIDの配列を返します（配信者を含む）。"
            }
        ],
        categories: ["common", "trigger based"],
        possibleDataOutput: ["array"]
    },
    evaluator: (trigger: Trigger, includeStreamer = true, filterType = "raw") => {
        const participants = Object.values(SharedChatCache.participants);
        if (!includeStreamer || includeStreamer === "false") {
            const streamerId = AccountAccess.getAccounts().streamer.userId;
            if (!streamerId) {
                return participants;
            }
            return participants.filter(p => p.broadcasterId !== streamerId);
        }

        if (filterType === "username") {
            return participants.map(p => p.broadcasterName);
        }

        if (filterType === "displayName") {
            return participants.map(p => p.broadcasterDisplayName);
        }

        if (filterType === "userId") {
            return participants.map(p => p.broadcasterId);
        }

        return participants.map(p => ({
            userId: p.broadcasterId,
            username: p.broadcasterName,
            displayName: p.broadcasterDisplayName
        }));
    }
};

export default model;