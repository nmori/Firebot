"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');
const frontendCommunicator = require("../../common/frontend-communicator");

const model = {
    definition: {
        id: "firebot:mark-all-activity-acknowledged",
        name: "すべての活動を承認済みとしてマークする",
        description: "チャットページですべてのアクティビティを承認済みとしてマークします。",
        icon: "fad fa-comment-dots",
        categories: [EffectCategory.COMMON],
        dependencies: []
    },
    optionsTemplate: `
        <eos-container pad-top="true">
            <p>この演出が実行されると、チャットページのイベント履歴内のすべてのアクティビティが確認済みとしてマークされます。ホットキーやStreamDeckに接続することで、現在のすべてのアクティビティを素早く確認することができます。</p>
        </eos-container>
    `,
    optionsController: () => {},
    onTriggerEvent: async () => {

        frontendCommunicator.fireEventAsync("acknowledge-all-activity");

        return true;
    }
};

module.exports = model;
