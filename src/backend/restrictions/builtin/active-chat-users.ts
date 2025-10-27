/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

import type { RestrictionType } from "../../../types/restrictions";
import { ActiveUserHandler } from "../../chat/active-user-handler";

const model: RestrictionType<never> = {
    definition: {
        id: "firebot:activeChatUsers",
        name: "アクティブなチャットユーザ数",
        description: "アクティブなチャットユーザーのみに制限.",
        triggers: []
    },
    optionsTemplate: `
        <div>
            <div>
                <p>アクティブなチャットユーザー（最近チャットした人）のみに制限する</p>
            </div>
        </div>
    `,
    predicate: async (triggerData) => {
        return new Promise((resolve, reject) => {
            const username = triggerData.metadata.username;

            if (ActiveUserHandler.userIsActive(username)) {
                resolve(true);
            } else {
                reject("最近チャットメッセージを送信していない");
            }
        });
    }
};

export = model;