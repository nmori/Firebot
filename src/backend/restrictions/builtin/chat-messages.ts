/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

import type { RestrictionType } from "../../../types/restrictions";
import viewerDatabase from '../../viewers/viewer-database';

const model: RestrictionType<{
    messages: number;
}> = {
    definition: {
        id: "firebot:chatMessages",
        name: "チャットメッセージ数",
        description: "一定数以上のチャットメッセージを送信したユーザーのみに制限します。",
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
      function that resolves/rejects a promise based on if the restriction criteria is met
    */
    predicate: (triggerData, restrictionData) => {
        return new Promise(async (resolve, reject) => {
            let passed = false;
            const viewer = await viewerDatabase.getViewerByUsername(triggerData.metadata.username);
            const chatMessages = viewer.chatMessages;

            if (chatMessages >= restrictionData.messages) {
                passed = true;
            }

            if (passed) {
                resolve(true);
            } else {
                reject("このチャンネルで送信したチャットメッセージ数が足りません");
            }
        });
    }
};

export = model;