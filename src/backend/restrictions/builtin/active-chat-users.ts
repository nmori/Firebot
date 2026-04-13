/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

import type { RestrictionType } from "../../../types/restrictions";
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
    predicate: async (triggerData) => {
        return new Promise((resolve, reject) => {
            const username = triggerData.metadata.username;

            if (ActiveUserHandler.userIsActive(username)) {
                resolve(true);
            } else {
                reject("最近チャットメッセージを送信していません");
            }
        });
    }
};

export = model;