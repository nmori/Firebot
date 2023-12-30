"use strict";

const model = {
    definition: {
        id: "firebot:viewTime",
        name: "視聴時間",
        description: "配信にn分間滞在したユーザーに制限する。",
        triggers: []
    },
    optionsTemplate: `
        <div>
            <div id="viewTimeRestriction" class="modal-subheader" style="padding: 0 0 4px 0">
                最低視聴時間
            </div>
            <input type="number" class="form-control" placeholder="Enter minutes" ng-model="restriction.time">
        </div>
    `,
    optionsValueDisplay: (restriction) => {
        const time = restriction.time || 0;

        return `${time}+ min(s)`;
    },
    /*
      function that resolves/rejects a promise based on if the restriction critera is met
    */
    predicate: (triggerData, restrictionData) => {
        return new Promise(async (resolve, reject) => {
            let passed = false;
            const viewerDB = require('../../database/userDatabase');
            const viewer = await viewerDB.getUserByUsername(triggerData.metadata.username);
            const viewtime = viewer.minutesInChannel;

            if (viewtime >= restrictionData.time) {
                passed = true;
            }

            if (passed) {
                resolve();
            } else {
                reject("このチャンネルの視聴時間が足りません");
            }
        });
    }
};

module.exports = model;