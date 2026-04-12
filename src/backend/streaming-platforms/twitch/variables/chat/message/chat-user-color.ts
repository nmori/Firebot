import type { ReplaceVariable } from "../../../../../../types/variables";
import { AccountAccess } from "../../../../../common/account-access";
import { TwitchApi } from "../../../api";
import viewerDatabase from "../../../../../viewers/viewer-database";

const DEFAULT_COLOR = "#ffffff";

const model : ReplaceVariable = {
    definition: {
        handle: "chatUserColor",
        description: "コマンドまたはイベントに関連するチャットユーザーの表示色を出力します。",
        examples: [
            {
                usage: "chatUserColor[$target]",
                description: "コマンド実行時に、ターゲットユーザーの色を取得します。"
            },
            {
                usage: "chatUserColor[$user]",
                description: "関連ユーザー（コマンド実行者、ボタン押下者など）の色を取得します。"
            }
        ],
        categories: ["common", "user based"],
        possibleDataOutput: ["text"]
    },
    evaluator: async (trigger, username: string) => {
        try {
            let chatColor:string | undefined;
            if (username != null) {
                const viewer = await viewerDatabase.getViewerByUsername(username);
                if (viewer != null) {
                    chatColor = await TwitchApi.chat.getColorForUser(viewer._id);
                }
                return chatColor ?? DEFAULT_COLOR;
            }
            if (trigger.metadata.chatMessage) {
                chatColor = trigger?.metadata?.chatMessage?.color;
            } else if (trigger.type === "event" || trigger.type === "manual") {
                chatColor = trigger?.metadata?.eventData?.chatMessage?.color;
            }
            if (chatColor == null) {
                const userId = trigger?.metadata?.userId as string ?? AccountAccess.getAccounts().streamer.userId;
                chatColor = await TwitchApi.chat.getColorForUser(userId);
            }
            return chatColor ?? DEFAULT_COLOR;
        } catch {
            return DEFAULT_COLOR;
        }
    }
};

export default model;