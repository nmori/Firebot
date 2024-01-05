"use strict";

const model = {
    definition: {
        id: "firebot:followcheck",
        name: "フォローチェック",
        description: "カンマ区切りのリストで、ユーザが全員をフォローしているかどうかに基づいて制限する.",
        triggers: []
    },
    optionsTemplate: `
        <div>
            <div id="userFollowList" class="modal-subheader" style="padding: 0 0 4px 0">
                フォロー
            </div>
            <input type="text" class="form-control" placeholder="値を入れる" ng-model="restriction.value">
        </div>
    `,
    optionsValueDisplay: (restriction) => {
        const value = restriction.value;

        if (value == null) {
            return "";
        }

        return value;
    },
    /*
      function that resolves/rejects a promise based on if the restriction criteria is met
    */
    predicate: async (trigger, restrictionData) => {
        return new Promise(async (resolve, reject) => {
            const userAccess = require("../../common/user-access");

            const triggerUsername = trigger.metadata.username || "";
            const followListString = restrictionData.value || "";

            if (triggerUsername === "", followListString === "") {
                return resolve();
            }

            const followCheckList = followListString.split(',')
                .filter(f => f != null)
                .map(f => f.toLowerCase().trim());

            const followCheck = await userAccess.userFollowsChannels(triggerUsername, followCheckList);

            if (followCheck) {
                return resolve();
            }

            return reject("次の操作が必要です: " + restrictionData.value);
        });
    }
};

module.exports = model;