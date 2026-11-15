import type { RestrictionType } from "../../../types";
import { ActiveUserHandler } from "../../chat/active-user-handler";

const model: RestrictionType<never> = {
    definition: {
        id: "firebot:activeChatUsers",
        name: "アクティブチャットユーザー",
        description: "最近チャットしたアクティブユーザーのみに制限します。",
        triggers: []
    },
    optionsTemplate: `
        <div>
            <div>
                <p>最近チャットしたアクティブユーザーのみに制限します。</p>
            </div>
        </div>
    `,
    predicate: ({ metadata }) => {
        const username = metadata.username;
        const success = ActiveUserHandler.userIsActive(username);

        return {
            success,
            failureReason: success !== true
                ? "最近チャットメッセージを送信していません"
                : undefined
        };
    }
};

export = model;