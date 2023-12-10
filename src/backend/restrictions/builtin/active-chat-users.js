"use strict";

const model = {
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
    /*
      function that resolves/rejects a promise based on if the restriction critera is met
    */
    predicate: (triggerData) => {
        return new Promise((resolve, reject) => {
            const activeUserHandler = require("../../chat/chat-listeners/active-user-handler");
            const username = triggerData.metadata.username;

            if (activeUserHandler.userIsActive(username)) {
                resolve();
            } else {
                reject("最近チャットメッセージを送信していない");
            }
        });
    }

};

module.exports = model;