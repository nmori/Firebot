"use strict";

const model = {
    definition: {
        id: "firebot:chatMessages",
        name: "チャットメッセージ",
        description: "一定数のチャットメッセージを送信したユーザーに制限する.",
        triggers: []
    },
    optionsTemplate: `
        <div>
            <div id="chatMessageRestriction" class="modal-subheader" style="padding: 0 0 4px 0">
                最低メッセージ数
            </div>
            <input type="number" class="form-control" placeholder="0" ng-model="restriction.messages">
        </div>
    `,
    optionsValueDisplay: (restriction) => {
        const messages = restriction.messages || 0;

        return `${messages}+`;
    },
    /*
      function that resolves/rejects a promise based on if the restriction critera is met
    */
    predicate: (triggerData, restrictionData) => {
        return new Promise(async (resolve, reject) => {
            let passed = false;
            const viewerDB = require('../../database/userDatabase');
            const viewer = await viewerDB.getUserByUsername(triggerData.metadata.username);
            const chatMessages = viewer.chatMessages;

            if (chatMessages >= restrictionData.messages) {
                passed = true;
            }

            if (passed) {
                resolve();
            } else {
                reject("このチャンネルでのチャット送信数が不足しています。");
            }
        });
    }
};

module.exports = model;